import type { UserEntity, UserPublic } from "../types/models.js";

export function toPublicUser(user: UserEntity): UserPublic {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}
