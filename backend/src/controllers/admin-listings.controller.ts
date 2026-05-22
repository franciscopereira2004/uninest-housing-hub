import type { FastifyReply, FastifyRequest } from "fastify";
import {
  adminListingsFiltersSchema,
  listingIdParamSchema,
  rejectListingSchema
} from "../schemas/listings.schema.js";
import type { AdminListingsService } from "../services/admin-listings.service.js";

export class AdminListingsController {
  constructor(private readonly service: AdminListingsService) {}

  listAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = adminListingsFiltersSchema.parse(request.query);
    const listings = await this.service.listAll(query);
    return reply.send({ data: listings });
  };

  listPending = async (_request: FastifyRequest, reply: FastifyReply) => {
    const listings = await this.service.listPending();
    return reply.send({ data: listings });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = listingIdParamSchema.parse(request.params);
    const listing = await this.service.getById(id);
    return reply.send({ data: listing });
  };

  approve = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = listingIdParamSchema.parse(request.params);
    const listing = await this.service.approve(id);
    return reply.send({ data: listing });
  };

  reject = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = listingIdParamSchema.parse(request.params);
    const body = rejectListingSchema.parse(request.body);
    const listing = await this.service.reject(id, body.reason);
    return reply.send({ data: listing });
  };

  suspend = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = listingIdParamSchema.parse(request.params);
    const listing = await this.service.suspend(id);
    return reply.send({ data: listing });
  };
}
