import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { UsersRepository } from "../repositories/users.repository.js";
import type { UserPublic, UserRole } from "../types/models.js";
import { HttpError } from "../utils/http-error.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { toPublicUser } from "../utils/token.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly fastify: FastifyInstance
  ) {}

  async register(input: RegisterInput): Promise<{ user: UserPublic; token: string }> {
    const existing = await this.usersRepository.findByEmail(input.email);
    if (existing) {
      throw new HttpError(409, "Já existe uma conta com este email.");
    }

    const now = new Date().toISOString();
    const user = await this.usersRepository.create({
      id: `u-${randomUUID()}`,
      role: input.role,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
      createdAt: now,
      updatedAt: now
    });

    const token = await this.fastify.jwt.sign({
      sub: user.id,
      role: user.role
    });

    return {
      user: toPublicUser(user),
      token
    };
  }

  async login(input: LoginInput): Promise<{ user: UserPublic; token: string }> {
    const user = await this.usersRepository.findByEmail(input.email);
    if (!user) {
      throw new HttpError(401, "Credenciais inválidas.");
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new HttpError(401, "Credenciais inválidas.");
    }

    const token = await this.fastify.jwt.sign({
      sub: user.id,
      role: user.role
    });

    return {
      user: toPublicUser(user),
      token
    };
  }

  async me(userId: string): Promise<UserPublic> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, "Utilizador não encontrado.");
    }

    return toPublicUser(user);
  }
}
