import type { FastifyReply, FastifyRequest } from "fastify";
import {
  conversationIdParamSchema,
  sendMessageSchema,
  startConversationSchema
} from "../schemas/messaging.schema.js";
import type { MessagingService } from "../services/messaging.service.js";
import { HttpError } from "../utils/http-error.js";

export class MessagingController {
  constructor(private readonly service: MessagingService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.userId(request);
    const data = await this.service.listForUser(userId);
    return reply.send({ data });
  };

  start = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.userId(request);
    const body = startConversationSchema.parse(request.body);
    const result = await this.service.startConversation(userId, body.listingId, body.body);
    return reply.status(201).send({ data: result });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.userId(request);
    const { id } = conversationIdParamSchema.parse(request.params);
    const conversation = await this.service.getConversation(userId, id);
    return reply.send({ data: conversation });
  };

  listMessages = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.userId(request);
    const { id } = conversationIdParamSchema.parse(request.params);
    const messages = await this.service.listMessages(userId, id);
    return reply.send({ data: messages });
  };

  sendMessage = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.userId(request);
    const { id } = conversationIdParamSchema.parse(request.params);
    const { body } = sendMessageSchema.parse(request.body);
    const message = await this.service.sendMessage(userId, id, body);
    return reply.status(201).send({ data: message });
  };

  private userId(request: FastifyRequest): string {
    const sub = (request.user as { sub?: string } | undefined)?.sub;
    if (!sub) throw new HttpError(401, "Sessão inválida.");
    return sub;
  }
}
