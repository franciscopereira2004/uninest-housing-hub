import type { Container } from "@azure/cosmos";
import type { FavouriteEntity } from "../types/models.js";

export interface FavouritesRepository {
  findByStudent(studentId: string): Promise<FavouriteEntity[]>;
  findOne(studentId: string, listingId: string): Promise<FavouriteEntity | null>;
  create(entity: FavouriteEntity): Promise<FavouriteEntity>;
  delete(id: string): Promise<void>;
}

export class InMemoryFavouritesRepository implements FavouritesRepository {
  private items = new Map<string, FavouriteEntity>();

  async findByStudent(studentId: string): Promise<FavouriteEntity[]> {
    return Array.from(this.items.values())
      .filter((f) => f.studentId === studentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findOne(studentId: string, listingId: string): Promise<FavouriteEntity | null> {
    for (const f of this.items.values()) {
      if (f.studentId === studentId && f.listingId === listingId) return f;
    }
    return null;
  }

  async create(entity: FavouriteEntity): Promise<FavouriteEntity> {
    this.items.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}

export class CosmosFavouritesRepository implements FavouritesRepository {
  constructor(private readonly container: Container) {}

  async findByStudent(studentId: string): Promise<FavouriteEntity[]> {
    const { resources } = await this.container.items
      .query<FavouriteEntity>({
        query: "SELECT * FROM c WHERE c.studentId = @studentId ORDER BY c.createdAt DESC",
        parameters: [{ name: "@studentId", value: studentId }]
      })
      .fetchAll();
    return resources;
  }

  async findOne(studentId: string, listingId: string): Promise<FavouriteEntity | null> {
    const { resources } = await this.container.items
      .query<FavouriteEntity>({
        query: "SELECT TOP 1 * FROM c WHERE c.studentId = @s AND c.listingId = @l",
        parameters: [
          { name: "@s", value: studentId },
          { name: "@l", value: listingId }
        ]
      })
      .fetchAll();
    return resources[0] ?? null;
  }

  async create(entity: FavouriteEntity): Promise<FavouriteEntity> {
    const { resource } = await this.container.items.create<FavouriteEntity>(entity);
    return (resource as FavouriteEntity | undefined) ?? entity;
  }

  async delete(id: string): Promise<void> {
    try {
      await this.container.item(id, id).delete();
    } catch (err) {
      if ((err as { code?: number }).code === 404) return;
      throw err;
    }
  }
}
