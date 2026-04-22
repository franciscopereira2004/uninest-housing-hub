import type { Container } from "@azure/cosmos";
import type { UserEntity } from "../types/models.js";

export interface UsersRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
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

  async create(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, user);
    return user;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, user);
    return user;
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

  async create(user: UserEntity): Promise<UserEntity> {
    const { resource } = await this.container.items.create<UserEntity>(user);
    return resource as UserEntity;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const { resource } = await this.container.item(user.id, user.id).replace<UserEntity>(user);
    return resource as UserEntity;
  }
}
