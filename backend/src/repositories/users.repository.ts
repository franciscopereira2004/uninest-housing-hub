import type { Container } from "@azure/cosmos";
import type { UserEntity, UserRole } from "../types/models.js";

export type UserSortField = "name" | "email" | "role" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface ListUsersFilters {
  search?: string;
  role?: UserRole;
  sortBy?: UserSortField;
  sortDir?: SortDirection;
}

export interface UsersRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findAll(filters?: ListUsersFilters): Promise<UserEntity[]>;
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}

const SORT_FIELDS: Record<UserSortField, true> = {
  name: true,
  email: true,
  role: true,
  createdAt: true
};

function normalizeSort(filters?: ListUsersFilters): { sortBy: UserSortField; sortDir: SortDirection } {
  const sortBy = filters?.sortBy && SORT_FIELDS[filters.sortBy] ? filters.sortBy : "createdAt";
  const sortDir: SortDirection = filters?.sortDir === "asc" ? "asc" : "desc";
  return { sortBy, sortDir };
}

export class InMemoryUsersRepository implements UsersRepository {
  private users = new Map<string, UserEntity>();

  async findByEmail(email: string): Promise<UserEntity | null> {
    const lower = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === lower) return user;
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) ?? null;
  }

  async findAll(filters?: ListUsersFilters): Promise<UserEntity[]> {
    let results = Array.from(this.users.values());

    const search = filters?.search?.trim().toLowerCase();
    if (search) {
      results = results.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      );
    }

    if (filters?.role) {
      results = results.filter((u) => u.role === filters.role);
    }

    const { sortBy, sortDir } = normalizeSort(filters);
    const factor = sortDir === "asc" ? 1 : -1;
    results.sort((a, b) => {
      const av = a[sortBy] ?? "";
      const bv = b[sortBy] ?? "";
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });

    return results;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, user);
    return user;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}

export class CosmosUsersRepository implements UsersRepository {
  constructor(private readonly container: Container) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const query = {
      query: "SELECT TOP 1 * FROM c WHERE LOWER(c.email) = @email",
      parameters: [{ name: "@email", value: email.toLowerCase() }]
    };
    const { resources } = await this.container.items.query<UserEntity>(query).fetchAll();
    return resources[0] ?? null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const { resource } = await this.container.item(id, id).read<UserEntity>();
    return resource ?? null;
  }

  async findAll(filters?: ListUsersFilters): Promise<UserEntity[]> {
    const conditions: string[] = [];
    const parameters: Array<{ name: string; value: string }> = [];

    const search = filters?.search?.trim().toLowerCase();
    if (search) {
      conditions.push("(CONTAINS(LOWER(c.name), @q) OR CONTAINS(LOWER(c.email), @q))");
      parameters.push({ name: "@q", value: search });
    }

    if (filters?.role) {
      conditions.push("c.role = @role");
      parameters.push({ name: "@role", value: filters.role });
    }

    const { sortBy, sortDir } = normalizeSort(filters);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = {
      query: `SELECT * FROM c ${whereClause} ORDER BY c.${sortBy} ${sortDir.toUpperCase()}`.trim(),
      parameters
    };

    const { resources } = await this.container.items.query<UserEntity>(query).fetchAll();
    return resources;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const { resource } = await this.container.items.create<UserEntity>(user);
    return resource as UserEntity;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const { resource } = await this.container.item(user.id, user.id).replace<UserEntity>(user);
    return resource as UserEntity;
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
