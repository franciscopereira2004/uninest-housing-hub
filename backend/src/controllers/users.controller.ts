import type { FastifyReply, FastifyRequest } from "fastify";
import type { UsersService } from "../services/users.service.js";
import {
  blockUserSchema,
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  userIdParamSchema
} from "../schemas/users.schema.js";

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const filters = listUsersQuerySchema.parse(request.query);
    const users = await this.usersService.list(filters);
    return reply.send({ data: users });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = userIdParamSchema.parse(request.params);
    const user = await this.usersService.getById(id);
    return reply.send({ data: user });
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createUserSchema.parse(request.body);
    const user = await this.usersService.create(body);
    return reply.status(201).send({ data: user });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = userIdParamSchema.parse(request.params);
    const body = updateUserSchema.parse(request.body);
    const user = await this.usersService.update(id, body);
    return reply.send({ data: user });
  };

  setBlocked = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = userIdParamSchema.parse(request.params);
    const body = blockUserSchema.parse(request.body);
    const actorId = (request.user as { sub: string }).sub;
    const user = await this.usersService.setBlocked(id, body.isBlocked, actorId);
    return reply.send({ data: user });
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = userIdParamSchema.parse(request.params);
    const actorId = (request.user as { sub: string }).sub;
    await this.usersService.delete(id, actorId);
    return reply.status(204).send();
  };
}
