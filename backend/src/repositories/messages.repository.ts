import type { Container } from "@azure/cosmos";
import type { MessageEntity } from "../types/models.js";

export interface MessagesRepository {
  findByConversation(conversationId: string): Promise<MessageEntity[]>;
  create(entity: MessageEntity): Promise<MessageEntity>;
  countUnreadForUser(conversationId: string, userId: string): Promise<number>;
  markRead(conversationId: string, userId: string): Promise<void>;
}

export class InMemoryMessagesRepository implements MessagesRepository {
  private items = new Map<string, MessageEntity>();

  async findByConversation(conversationId: string): Promise<MessageEntity[]> {
    return Array.from(this.items.values())
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async create(entity: MessageEntity): Promise<MessageEntity> {
    this.items.set(entity.id, entity);
    return entity;
  }

  async countUnreadForUser(conversationId: string, userId: string): Promise<number> {
    let count = 0;
    for (const m of this.items.values()) {
      if (m.conversationId === conversationId && m.receiverId === userId && !m.isRead) count++;
    }
    return count;
  }

  async markRead(conversationId: string, userId: string): Promise<void> {
    for (const m of this.items.values()) {
      if (m.conversationId === conversationId && m.receiverId === userId && !m.isRead) {
        m.isRead = true;
        this.items.set(m.id, m);
      }
    }
  }
}

export class CosmosMessagesRepository implements MessagesRepository {
  constructor(private readonly container: Container) {}

  async findByConversation(conversationId: string): Promise<MessageEntity[]> {
    const { resources } = await this.container.items
      .query<MessageEntity>({
        query: "SELECT * FROM c WHERE c.conversationId = @c ORDER BY c.createdAt ASC",
        parameters: [{ name: "@c", value: conversationId }]
      })
      .fetchAll();
    return resources;
  }

  async create(entity: MessageEntity): Promise<MessageEntity> {
    const { resource } = await this.container.items.create<MessageEntity>(entity);
    return (resource as MessageEntity | undefined) ?? entity;
  }

  async countUnreadForUser(conversationId: string, userId: string): Promise<number> {
    const { resources } = await this.container.items
      .query<{ count: number }>({
        query:
          "SELECT VALUE COUNT(1) FROM c WHERE c.conversationId = @c AND c.receiverId = @u AND c.isRead = false",
        parameters: [
          { name: "@c", value: conversationId },
          { name: "@u", value: userId }
        ]
      })
      .fetchAll();
    return Number(resources[0] ?? 0);
  }

  async markRead(conversationId: string, userId: string): Promise<void> {
    const { resources } = await this.container.items
      .query<MessageEntity>({
        query:
          "SELECT * FROM c WHERE c.conversationId = @c AND c.receiverId = @u AND c.isRead = false",
        parameters: [
          { name: "@c", value: conversationId },
          { name: "@u", value: userId }
        ]
      })
      .fetchAll();

    for (const message of resources) {
      message.isRead = true;
      await this.container.items.upsert(message);
    }
  }
}
