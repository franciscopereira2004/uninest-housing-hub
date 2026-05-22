import type { FastifyReply, FastifyRequest } from "fastify";
import { changeMyPasswordSchema, updateMyProfileSchema } from "../schemas/profile.schema.js";
import type { UsersService } from "../services/users.service.js";
import { HttpError } from "../utils/http-error.js";

export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.userId(request);
    const user = await this.usersService.getById(userId);
    return reply.send({ data: user });
  };

  updateMe = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.userId(request);
    const body = updateMyProfileSchema.parse(request.body);
    const user = await this.usersService.updateOwnProfile(userId, body);
    return reply.send({ data: user });
  };

  changePassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.userId(request);
    const body = changeMyPasswordSchema.parse(request.body);
    await this.usersService.changeOwnPassword(userId, body.currentPassword, body.newPassword);
    return reply.send({ data: { ok: true } });
  };

  private userId(request: FastifyRequest): string {
    const sub = (request.user as { sub?: string } | undefined)?.sub;
    if (!sub) throw new HttpError(401, "Sessão inválida.");
    return sub;
  }
}
