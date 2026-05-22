import type { ListingsRepository } from "../repositories/listings.repository.js";
import type { ListingEntity, ListingStatus } from "../types/models.js";
import { HttpError } from "../utils/http-error.js";

export class AdminListingsService {
  constructor(private readonly listingsRepository: ListingsRepository) {}

  async listAll(filters: { status?: ListingStatus }): Promise<ListingEntity[]> {
    return this.listingsRepository.findAll(filters);
  }

  async listPending(): Promise<ListingEntity[]> {
    return this.listingsRepository.findAll({ status: "pending" });
  }

  async getById(id: string): Promise<ListingEntity> {
    const listing = await this.listingsRepository.findById(id);
    if (!listing) {
      throw new HttpError(404, "Anúncio não encontrado.");
    }
    return listing;
  }

  async approve(id: string): Promise<ListingEntity> {
    const listing = await this.getById(id);
    if (listing.status === "approved") return listing;
    return this.listingsRepository.upsert({
      ...listing,
      status: "approved",
      rejectionReason: undefined,
      updatedAt: new Date().toISOString()
    });
  }

  async reject(id: string, reason: string): Promise<ListingEntity> {
    const listing = await this.getById(id);
    return this.listingsRepository.upsert({
      ...listing,
      status: "rejected",
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    });
  }

  async suspend(id: string): Promise<ListingEntity> {
    const listing = await this.getById(id);
    return this.listingsRepository.upsert({
      ...listing,
      status: "suspended",
      updatedAt: new Date().toISOString()
    });
  }
}
