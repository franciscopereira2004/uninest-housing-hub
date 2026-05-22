import type { Container } from "@azure/cosmos";
import type { ConversationEntity } from "../types/models.js";

export interface ConversationsRepository {
  findForUser(userId: string): Promise<ConversationEntity[]>;
  findById(id: string): Promise<ConversationEntity | null>;
  findOne(listingId: string, studentId: string): Promise<ConversationEntity | null>;
  upsert(entity: ConversationEntity): Promise<ConversationEntity>;
}

export class InMemoryConversationsRepository implements ConversationsRepository {
  private items = new Map<string, ConversationEntity>();

  async findForUser(userId: string): Promise<ConversationEntity[]> {
    return Array.from(this.items.values())
      .filter((c) => c.studentId === userId || c.landlordId === userId)
      .sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt));
  }

  async findById(id: string): Promise<ConversationEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findOne(listingId: string, studentId: string): Promise<ConversationEntity | null> {
    for (const c of this.items.values()) {
      if (c.listingId === listingId && c.studentId === studentId) return c;
    }
    return null;
  }

  async upsert(entity: ConversationEntity): Promise<ConversationEntity> {
    this.items.set(entity.id, entity);
    return entity;
  }
}

export class CosmosConversationsRepository implements ConversationsRepository {
  constructor(private readonly container: Container) {}

  async findForUser(userId: string): Promise<ConversationEntity[]> {
    const { resources } = await this.container.items
      .query<ConversationEntity>({
        query:
          "SELECT * FROM c WHERE c.studentId = @u OR c.landlordId = @u ORDER BY c.lastMessageAt DESC",
        parameters: [{ name: "@u", value: userId }]
      })
      .fetchAll();
    return resources;
  }

  async findById(id: string): Promise<ConversationEntity | null> {
    const { resources } = await this.container.items
      .query<ConversationEntity>({
        query: "SELECT TOP 1 * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: id }]
      })
      .fetchAll();
    return resources[0] ?? null;
  }

  async findOne(listingId: string, studentId: string): Promise<ConversationEntity | null> {
    const { resources } = await this.container.items
      .query<ConversationEntity>({
        query: "SELECT TOP 1 * FROM c WHERE c.listingId = @l AND c.studentId = @s",
        parameters: [
          { name: "@l", value: listingId },
          { name: "@s", value: studentId }
        ]
      })
      .fetchAll();
    return resources[0] ?? null;
  }

  async upsert(entity: ConversationEntity): Promise<ConversationEntity> {
    const { resource } = await this.container.items.upsert<ConversationEntity>(entity);
    return (resource as ConversationEntity | undefined) ?? entity;
  }
}
