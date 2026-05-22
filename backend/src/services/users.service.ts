import { randomUUID } from "node:crypto";
import type { ListUsersFilters, UsersRepository } from "../repositories/users.repository.js";
import type { LandlordProfile, StudentProfile, UserPublic, UserRole } from "../types/models.js";
import { HttpError } from "../utils/http-error.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { toPublicUser } from "../utils/token.js";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  avatarUrl?: string;
  isBlocked?: boolean;
}

export interface UpdateOwnProfileInput {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  studentProfile?: StudentProfile;
  landlordProfile?: LandlordProfile;
}

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async list(filters: ListUsersFilters): Promise<UserPublic[]> {
    const users = await this.usersRepository.findAll(filters);
    return users.map(toPublicUser);
  }

  async getById(id: string): Promise<UserPublic> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new HttpError(404, "Utilizador não encontrado.");
    }
    return toPublicUser(user);
  }

  async create(input: CreateUserInput): Promise<UserPublic> {
    const email = input.email.toLowerCase();
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Já existe uma conta com este email.");
    }

    const now = new Date().toISOString();
    const user = await this.usersRepository.create({
      id: `u-${randomUUID()}`,
      role: input.role,
      name: input.name,
      email,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
      passwordHash: await hashPassword(input.password),
      isBlocked: false,
      createdAt: now,
      updatedAt: now
    });

    return toPublicUser(user);
  }

  async update(id: string, input: UpdateUserInput): Promise<UserPublic> {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new HttpError(404, "Utilizador não encontrado.");
    }

    if (input.email && input.email.toLowerCase() !== existing.email.toLowerCase()) {
      const collision = await this.usersRepository.findByEmail(input.email);
      if (collision && collision.id !== id) {
        throw new HttpError(409, "Já existe uma conta com este email.");
      }
    }

    const updated = await this.usersRepository.update({
      ...existing,
      name: input.name ?? existing.name,
      email: input.email ? input.email.toLowerCase() : existing.email,
      phone: input.phone ?? existing.phone,
      role: input.role ?? existing.role,
      avatarUrl: input.avatarUrl ?? existing.avatarUrl,
      isBlocked: input.isBlocked ?? existing.isBlocked,
      updatedAt: new Date().toISOString()
    });

    return toPublicUser(updated);
  }

  async updateOwnProfile(id: string, input: UpdateOwnProfileInput): Promise<UserPublic> {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new HttpError(404, "Utilizador não encontrado.");
    }
    if (existing.isBlocked) {
      throw new HttpError(403, "Conta bloqueada.");
    }

    if (input.studentProfile && existing.role !== "student") {
      throw new HttpError(403, "Apenas estudantes podem alterar o perfil de estudante.");
    }
    if (input.landlordProfile && existing.role !== "landlord") {
      throw new HttpError(403, "Apenas senhorios podem alterar o perfil de senhorio.");
    }

    const updated = await this.usersRepository.update({
      ...existing,
      name: input.name ?? existing.name,
      phone: input.phone ?? existing.phone,
      avatarUrl: input.avatarUrl ?? existing.avatarUrl,
      studentProfile:
        input.studentProfile !== undefined
          ? { ...(existing.studentProfile ?? {}), ...input.studentProfile }
          : existing.studentProfile,
      landlordProfile:
        input.landlordProfile !== undefined
          ? { ...(existing.landlordProfile ?? {}), ...input.landlordProfile }
          : existing.landlordProfile,
      updatedAt: new Date().toISOString()
    });

    return toPublicUser(updated);
  }

  async changeOwnPassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new HttpError(404, "Utilizador não encontrado.");
    }
    if (existing.isBlocked) {
      throw new HttpError(403, "Conta bloqueada.");
    }

    const isValid = await verifyPassword(currentPassword, existing.passwordHash);
    if (!isValid) {
      throw new HttpError(400, "Password atual incorreta.");
    }

    if (currentPassword === newPassword) {
      throw new HttpError(400, "A nova password tem de ser diferente da atual.");
    }

    await this.usersRepository.update({
      ...existing,
      passwordHash: await hashPassword(newPassword),
      updatedAt: new Date().toISOString()
    });
  }

  async setBlocked(id: string, isBlocked: boolean, actorId: string): Promise<UserPublic> {
    if (id === actorId) {
      throw new HttpError(400, "Não podes bloquear-te a ti próprio.");
    }
    return this.update(id, { isBlocked });
  }

  async delete(id: string, actorId: string): Promise<void> {
    if (id === actorId) {
      throw new HttpError(400, "Não podes eliminar a tua própria conta.");
    }
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new HttpError(404, "Utilizador não encontrado.");
    }
    await this.usersRepository.delete(id);
  }
}
