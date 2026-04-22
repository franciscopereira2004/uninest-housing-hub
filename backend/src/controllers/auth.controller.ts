import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthService } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = registerSchema.parse(request.body);
    const result = await this.authService.register(body);
    return reply.status(201).send(result);
  };

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(request.body);
    const result = await this.authService.login(body);
    return reply.send(result);
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.user as { sub: string }).sub;
    const user = await this.authService.me(userId);
    return reply.send({ user });
  };
}
