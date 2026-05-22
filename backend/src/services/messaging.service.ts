import { randomUUID } from "node:crypto";
import type { ConversationsRepository } from "../repositories/conversations.repository.js";
import type { ListingsRepository } from "../repositories/listings.repository.js";
import type { MessagesRepository } from "../repositories/messages.repository.js";
import type { UsersRepository } from "../repositories/users.repository.js";
import type {
  ConversationEntity,
  ListingEntity,
  MessageEntity,
  UserEntity,
  UserPublic
} from "../types/models.js";
import { HttpError } from "../utils/http-error.js";
import { toPublicUser } from "../utils/token.js";
import type { MessagesHub } from "./messages-hub.js";

export interface ConversationSummary {
  conversation: ConversationEntity;
  listing: Pick<
    ListingEntity,
    "id" | "title" | "city" | "monthlyPrice" | "status" | "images"
  > | null;
  otherParticipant: UserPublic | null;
  unreadCount: number;
  lastMessage: MessageEntity | null;
}

export class MessagingService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly messagesRepository: MessagesRepository,
    private readonly listingsRepository: ListingsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly hub: MessagesHub
  ) {}

  async startConversation(
    studentId: string,
    listingId: string,
    body: string
  ): Promise<{ conversation: ConversationEntity; message: MessageEntity }> {
    const student = await this.assertActive(studentId);
    if (student.role !== "student") {
      throw new HttpError(403, "Apenas estudantes podem iniciar conversas.");
    }

    const listing = await this.listingsRepository.findById(listingId);
    if (!listing || listing.status !== "approved") {
      throw new HttpError(404, "Anúncio não encontrado.");
    }
    if (listing.landlordId === studentId) {
      throw new HttpError(400, "Não podes iniciar uma conversa contigo próprio.");
    }
    const landlord = await this.usersRepository.findById(listing.landlordId);
    if (!landlord || landlord.isBlocked) {
      throw new HttpError(404, "Senhorio indisponível.");
    }

    const existing = await this.conversationsRepository.findOne(listingId, studentId);
    const now = new Date().toISOString();
    const conversation =
      existing ??
      (await this.conversationsRepository.upsert({
        id: `c-${randomUUID()}`,
        listingId,
        studentId,
        landlordId: listing.landlordId,
        createdAt: now,
        updatedAt: now
      }));

    const message = await this.sendMessageInternal(conversation, studentId, body, now);
    return { conversation, message };
  }

  async listForUser(userId: string): Promise<ConversationSummary[]> {
    const user = await this.assertActive(userId);
    const conversations = await this.conversationsRepository.findForUser(userId);
    if (conversations.length === 0) return [];

    const listingIds = Array.from(new Set(conversations.map((c) => c.listingId)));
    const otherIds = Array.from(
      new Set(conversations.map((c) => (c.studentId === userId ? c.landlordId : c.studentId)))
    );
    const [listings, others] = await Promise.all([
      this.listingsRepository.findByIds(listingIds),
      Promise.all(otherIds.map((id) => this.usersRepository.findById(id)))
    ]);
    const listingsById = new Map(listings.map((l) => [l.id, l] as const));
    const usersById = new Map(
      others.filter((u): u is UserEntity => u !== null).map((u) => [u.id, u] as const)
    );

    const summaries: ConversationSummary[] = [];
    for (const conversation of conversations) {
      const otherId = conversation.studentId === userId ? conversation.landlordId : conversation.studentId;
      const otherUser = usersById.get(otherId) ?? null;
      const listing = listingsById.get(conversation.listingId);
      const messages = await this.messagesRepository.findByConversation(conversation.id);
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      const unreadCount = messages.filter((m) => m.receiverId === userId && !m.isRead).length;
      summaries.push({
        conversation,
        listing: listing
          ? {
              id: listing.id,
              title: listing.title,
              city: listing.city,
              monthlyPrice: listing.monthlyPrice,
              status: listing.status,
              images: listing.images
            }
          : null,
        otherParticipant: otherUser ? toPublicUser(otherUser) : null,
        unreadCount,
        lastMessage
      });
    }

    return summaries.sort((a, b) => {
      const ta = a.lastMessage?.createdAt ?? a.conversation.createdAt;
      const tb = b.lastMessage?.createdAt ?? b.conversation.createdAt;
      return tb.localeCompare(ta);
    });
    void user; // user already validated
  }

  async getConversation(userId: string, conversationId: string): Promise<ConversationEntity> {
    await this.assertActive(userId);
    const conversation = await this.conversationsRepository.findById(conversationId);
    if (!conversation || (conversation.studentId !== userId && conversation.landlordId !== userId)) {
      throw new HttpError(404, "Conversa não encontrada.");
    }
    return conversation;
  }

  async listMessages(userId: string, conversationId: string): Promise<MessageEntity[]> {
    const conversation = await this.getConversation(userId, conversationId);
    const before = await this.messagesRepository.countUnreadForUser(conversation.id, userId);
    const messages = await this.messagesRepository.findByConversation(conversation.id);
    if (before > 0) {
      await this.messagesRepository.markRead(conversation.id, userId);
      this.hub.emit({ type: "read", conversationId: conversation.id, readerId: userId });
    }
    return messages;
  }

  async sendMessage(userId: string, conversationId: string, body: string): Promise<MessageEntity> {
    const sender = await this.assertActive(userId);
    if (sender.isBlocked) {
      throw new HttpError(403, "Conta bloqueada.");
    }
    const conversation = await this.getConversation(userId, conversationId);
    return this.sendMessageInternal(conversation, userId, body);
  }

  private async sendMessageInternal(
    conversation: ConversationEntity,
    senderId: string,
    body: string,
    nowOverride?: string
  ): Promise<MessageEntity> {
    const trimmed = body.trim();
    if (!trimmed) {
      throw new HttpError(400, "A mensagem não pode estar vazia.");
    }
    const now = nowOverride ?? new Date().toISOString();
    const receiverId =
      conversation.studentId === senderId ? conversation.landlordId : conversation.studentId;
    const message: MessageEntity = {
      id: `m-${randomUUID()}`,
      conversationId: conversation.id,
      senderId,
      receiverId,
      body: trimmed,
      isRead: false,
      createdAt: now
    };
    await this.messagesRepository.create(message);
    await this.conversationsRepository.upsert({
      ...conversation,
      lastMessageAt: now,
      updatedAt: now
    });
    this.hub.emit({ type: "message", conversationId: conversation.id, message });
    return message;
  }

  private async assertActive(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new HttpError(401, "Sessão inválida.");
    }
    if (user.isBlocked) {
      throw new HttpError(403, "Conta bloqueada.");
    }
    return user;
  }
}
