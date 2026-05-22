import type { FastifyReply, FastifyRequest } from "fastify";
import {
  createListingSchema,
  listingIdParamSchema,
  listingsFiltersSchema,
  parseBool,
  updateListingSchema
} from "../schemas/listings.schema.js";
import type { ListingsService } from "../services/listings.service.js";
import type { UsersService } from "../services/users.service.js";
import { HttpError } from "../utils/http-error.js";

export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly usersService: UsersService
  ) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listingsFiltersSchema.parse(request.query);
    const listings = await this.listingsService.listPublic({
      keyword: query.keyword,
      city: query.city,
      nearbyUniversity: query.nearbyUniversity,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      types: query.types,
      internet: parseBool(query.internet),
      furnished: parseBool(query.furnished),
      billsIncluded: parseBool(query.billsIncluded),
      contractAvailable: parseBool(query.contractAvailable),
      bedrooms: query.bedrooms,
      maxDistance: query.maxDistance,
      availableFrom: query.availableFrom,
      sortBy: query.sortBy
    });

    return reply.send({ data: listings });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = listingIdParamSchema.parse(request.params);
    let viewer: { id: string; role: string } | undefined;
    if (request.headers.authorization) {
      try {
        await request.jwtVerify();
        const claims = request.user as { sub?: string; role?: string } | undefined;
        if (claims?.sub && claims.role) {
          viewer = { id: claims.sub, role: claims.role };
        }
      } catch {
        // anonymous viewer — ignore invalid token
      }
    }
    const listing = await this.listingsService.getPublicById(id, viewer);
    return reply.send({ data: listing });
  };

  // ---------- landlord-side ----------

  listMine = async (request: FastifyRequest, reply: FastifyReply) => {
    const landlordId = this.userId(request);
    const listings = await this.listingsService.listMine(landlordId);
    return reply.send({ data: listings });
  };

  getMineById = async (request: FastifyRequest, reply: FastifyReply) => {
    const landlordId = this.userId(request);
    const { id } = listingIdParamSchema.parse(request.params);
    const listing = await this.listingsService.getMineById(landlordId, id);
    return reply.send({ data: listing });
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const landlordId = this.userId(request);
    const landlord = await this.usersService.getById(landlordId);
    const body = createListingSchema.parse(request.body);
    const listing = await this.listingsService.create(landlord, body);
    return reply.status(201).send({ data: listing });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const landlordId = this.userId(request);
    const { id } = listingIdParamSchema.parse(request.params);
    const body = updateListingSchema.parse(request.body);
    const listing = await this.listingsService.update(landlordId, id, body);
    return reply.send({ data: listing });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const landlordId = this.userId(request);
    const { id } = listingIdParamSchema.parse(request.params);
    await this.listingsService.delete(landlordId, id);
    return reply.status(204).send();
  };

  private userId(request: FastifyRequest): string {
    const sub = (request.user as { sub?: string } | undefined)?.sub;
    if (!sub) throw new HttpError(401, "Sessão inválida.");
    return sub;
  }
}
