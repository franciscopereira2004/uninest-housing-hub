import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "../types/models.js";
import { HttpError } from "../utils/http-error.js";

export function requireRole(roles: UserRole[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const role = (request.user as { role?: UserRole } | undefined)?.role;
    if (!role || !roles.includes(role)) {
      throw new HttpError(403, "Não tens permissões para esta ação.");
    }
  };
}
