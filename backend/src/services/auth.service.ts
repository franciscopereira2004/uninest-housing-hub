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

const DEFAULT_LOGIN_PASSWORD = "ChangeMe123!";
const DEFAULT_LOGIN_USERS: Array<{ id: string; name: string; email: string; role: UserRole }> = [
  { id: "u-admin", name: "Admin", email: "admin@uninest.local", role: "admin" },
  { id: "u-landlord-1", name: "Maria Senhoria", email: "landlord@uninest.local", role: "landlord" },
  { id: "u-student-1", name: "João Estudante", email: "student@uninest.local", role: "student" }
];

export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly fastify: FastifyInstance
  ) {}

  async ensureDefaultLogins(): Promise<void> {
    for (const defaultUser of DEFAULT_LOGIN_USERS) {
      const existing = await this.usersRepository.findByEmail(defaultUser.email);
      if (existing) {
        continue;
      }

      const now = new Date().toISOString();
      await this.usersRepository.create({
        id: defaultUser.id,
        role: defaultUser.role,
        name: defaultUser.name,
        email: defaultUser.email,
        passwordHash: await hashPassword(DEFAULT_LOGIN_PASSWORD),
        isBlocked: false,
        createdAt: now,
        updatedAt: now
      });
      this.fastify.log.info(`Default login created: ${defaultUser.email}`);
    }
  }

  async register(input: RegisterInput): Promise<{ user: UserPublic; token: string }> {
    if (input.role === "admin") {
      throw new HttpError(403, "Não é permitido registar uma conta de administrador.");
    }

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
      isBlocked: false,
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

    if (user.isBlocked) {
      throw new HttpError(403, "A tua conta está bloqueada.");
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
