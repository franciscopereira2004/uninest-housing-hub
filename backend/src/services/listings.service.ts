import type { ListingsRepository } from "../repositories/listings.repository.js";
import type { ListingFilters } from "../types/models.js";
import { HttpError } from "../utils/http-error.js";

export class ListingsService {
  constructor(private readonly listingsRepository: ListingsRepository) {}

  async list(filters: ListingFilters) {
    return this.listingsRepository.findAll(filters);
  }

  async getById(id: string) {
    const listing = await this.listingsRepository.findById(id);
    if (!listing) {
      throw new HttpError(404, "Anúncio não encontrado.");
    }
    return listing;
  }
}
