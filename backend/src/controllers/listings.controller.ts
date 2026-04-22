import type { FastifyReply, FastifyRequest } from "fastify";
import { listingsFiltersSchema, parseBool } from "../schemas/listings.schema.js";
import type { ListingsService } from "../services/listings.service.js";

export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listingsFiltersSchema.parse(request.query);
    const listings = await this.listingsService.list({
      city: query.city,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      type: query.type,
      internet: parseBool(query.internet),
      furnished: parseBool(query.furnished),
      privateBathroom: parseBool(query.privateBathroom),
      availableFrom: query.availableFrom
    });

    return reply.send({ data: listings });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const listing = await this.listingsService.getById(params.id);
    return reply.send({ data: listing });
  };
}
