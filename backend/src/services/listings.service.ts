import { randomUUID } from "node:crypto";
import { seedHouses } from "../data/houses.seed.js";
import type { ListingsRepository } from "../repositories/listings.repository.js";
import type { UsersRepository } from "../repositories/users.repository.js";
import type { ListingEntity, ListingFilters, UserPublic } from "../types/models.js";
import { HttpError } from "../utils/http-error.js";
import type { CreateListingInput, UpdateListingInput } from "../schemas/listings.schema.js";

export interface LandlordSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  companyName?: string;
}

export type ListingWithLandlord = ListingEntity & { landlord?: LandlordSummary };

export class ListingsService {
  constructor(
    private readonly listingsRepository: ListingsRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  async listPublic(filters: ListingFilters): Promise<ListingEntity[]> {
    return this.listingsRepository.findPublic(filters);
  }

  async getPublicById(
    id: string,
    viewer?: { id: string; role: string }
  ): Promise<ListingWithLandlord> {
    const listing = await this.listingsRepository.findById(id);
    if (!listing) {
      throw new HttpError(404, "Anúncio não encontrado.");
    }
    const isOwner = viewer?.id === listing.landlordId;
    const isAdmin = viewer?.role === "admin";
    if (listing.status !== "approved" && !isOwner && !isAdmin) {
      throw new HttpError(404, "Anúncio não encontrado.");
    }
    if (!isOwner && !isAdmin) {
      await this.listingsRepository.incrementViews(id).catch(() => undefined);
    }

    const landlordUser = await this.usersRepository.findById(listing.landlordId);
    const landlord: LandlordSummary | undefined = landlordUser
      ? {
          id: landlordUser.id,
          name: landlordUser.name,
          avatarUrl: landlordUser.avatarUrl,
          phone: landlordUser.landlordProfile?.phone ?? landlordUser.phone,
          companyName: landlordUser.landlordProfile?.companyName
        }
      : undefined;

    return { ...listing, landlord };
  }

  async listMine(landlordId: string): Promise<ListingEntity[]> {
    return this.listingsRepository.findByLandlord(landlordId);
  }

  async getMineById(landlordId: string, id: string): Promise<ListingEntity> {
    const listing = await this.listingsRepository.findById(id);
    if (!listing || listing.landlordId !== landlordId) {
      throw new HttpError(404, "Anúncio não encontrado.");
    }
    return listing;
  }

  async create(landlord: UserPublic, input: CreateListingInput): Promise<ListingEntity> {
    await this.assertLandlordCanWrite(landlord.id);
    const now = new Date().toISOString();
    const listing: ListingEntity = {
      id: `l-${randomUUID()}`,
      landlordId: landlord.id,
      title: input.title,
      description: input.description,
      propertyType: input.propertyType,
      city: input.city,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      nearbyUniversity: input.nearbyUniversity,
      distanceToUniversity: input.distanceToUniversity,
      monthlyPrice: input.monthlyPrice,
      depositAmount: input.depositAmount,
      billsIncluded: input.billsIncluded,
      availableFrom: input.availableFrom,
      minimumStay: input.minimumStay,
      maxTenants: input.maxTenants,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      furnished: input.furnished,
      internetIncluded: input.internetIncluded,
      contractAvailable: input.contractAvailable,
      houseRules: input.houseRules ?? [],
      amenities: input.amenities ?? [],
      images: input.images,
      status: "pending",
      viewsCount: 0,
      createdAt: now,
      updatedAt: now
    };
    return this.listingsRepository.upsert(listing);
  }

  async update(landlordId: string, id: string, input: UpdateListingInput): Promise<ListingEntity> {
    await this.assertLandlordCanWrite(landlordId);
    const existing = await this.listingsRepository.findById(id);
    if (!existing || existing.landlordId !== landlordId) {
      throw new HttpError(404, "Anúncio não encontrado.");
    }
    if (existing.status === "suspended") {
      throw new HttpError(403, "Não é possível editar um anúncio suspenso.");
    }
    const merged: ListingEntity = {
      ...existing,
      ...input,
      houseRules: input.houseRules ?? existing.houseRules,
      amenities: input.amenities ?? existing.amenities,
      images: input.images ?? existing.images,
      // resubmitting a rejected listing returns it to the moderation queue
      status: existing.status === "rejected" ? "pending" : existing.status,
      rejectionReason: existing.status === "rejected" ? undefined : existing.rejectionReason,
      updatedAt: new Date().toISOString()
    };
    return this.listingsRepository.upsert(merged);
  }

  async delete(landlordId: string, id: string): Promise<void> {
    const existing = await this.listingsRepository.findById(id);
    if (!existing || existing.landlordId !== landlordId) {
      throw new HttpError(404, "Anúncio não encontrado.");
    }
    await this.listingsRepository.delete(id);
  }

  async ensureSeedListings(): Promise<number> {
    const existing = await this.listingsRepository.findAll({});
    if (existing.length > 0) {
      return 0;
    }
    for (const listing of seedHouses) {
      await this.listingsRepository.upsert(listing);
    }
    return seedHouses.length;
  }

  private async assertLandlordCanWrite(landlordId: string): Promise<void> {
    const user = await this.usersRepository.findById(landlordId);
    if (!user) {
      throw new HttpError(401, "Sessão inválida.");
    }
    if (user.role !== "landlord") {
      throw new HttpError(403, "Apenas senhorios podem gerir anúncios.");
    }
    if (user.isBlocked) {
      throw new HttpError(403, "Conta bloqueada. Contacta o suporte.");
    }
  }
}
