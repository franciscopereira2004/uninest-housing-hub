import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { FavouritesService } from "../services/favourites.service.js";
import { HttpError } from "../utils/http-error.js";

const listingIdParamSchema = z.object({
  listingId: z.string().min(1)
});

export class FavouritesController {
  constructor(private readonly service: FavouritesService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const studentId = this.userId(request);
    const data = await this.service.listMine(studentId);
    return reply.send({ data });
  };

  add = async (request: FastifyRequest, reply: FastifyReply) => {
    const studentId = this.userId(request);
    const { listingId } = listingIdParamSchema.parse(request.params);
    const favourite = await this.service.add(studentId, listingId);
    return reply.status(201).send({ data: favourite });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const studentId = this.userId(request);
    const { listingId } = listingIdParamSchema.parse(request.params);
    await this.service.remove(studentId, listingId);
    return reply.status(204).send();
  };

  private userId(request: FastifyRequest): string {
    const sub = (request.user as { sub?: string } | undefined)?.sub;
    if (!sub) throw new HttpError(401, "Sessão inválida.");
    return sub;
  }
}
