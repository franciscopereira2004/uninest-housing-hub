import { randomUUID } from "node:crypto";
import type { FavouritesRepository } from "../repositories/favourites.repository.js";
import type { ListingsRepository } from "../repositories/listings.repository.js";
import type { UsersRepository } from "../repositories/users.repository.js";
import type { FavouriteEntity, ListingEntity } from "../types/models.js";
import { HttpError } from "../utils/http-error.js";

export interface FavouriteListing {
  favouriteId: string;
  favouritedAt: string;
  listing: ListingEntity;
}

export class FavouritesService {
  constructor(
    private readonly favouritesRepository: FavouritesRepository,
    private readonly listingsRepository: ListingsRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  async listMine(studentId: string): Promise<FavouriteListing[]> {
    await this.assertStudentCanWrite(studentId);
    const favourites = await this.favouritesRepository.findByStudent(studentId);
    if (favourites.length === 0) return [];

    const listings = await this.listingsRepository.findByIds(favourites.map((f) => f.listingId));
    const byId = new Map(listings.map((l) => [l.id, l] as const));

    return favourites
      .map((f) => {
        const listing = byId.get(f.listingId);
        if (!listing) return null;
        return {
          favouriteId: f.id,
          favouritedAt: f.createdAt,
          listing
        };
      })
      .filter((item): item is FavouriteListing => item !== null);
  }

  async add(studentId: string, listingId: string): Promise<FavouriteEntity> {
    await this.assertStudentCanWrite(studentId);
    const listing = await this.listingsRepository.findById(listingId);
    if (!listing) {
      throw new HttpError(404, "Anúncio não encontrado.");
    }
    if (listing.status !== "approved") {
      throw new HttpError(400, "Só podes guardar anúncios aprovados.");
    }
    const existing = await this.favouritesRepository.findOne(studentId, listingId);
    if (existing) return existing;

    const now = new Date().toISOString();
    return this.favouritesRepository.create({
      id: `f-${randomUUID()}`,
      studentId,
      listingId,
      createdAt: now
    });
  }

  async remove(studentId: string, listingId: string): Promise<void> {
    await this.assertStudentCanWrite(studentId);
    const existing = await this.favouritesRepository.findOne(studentId, listingId);
    if (!existing) return;
    await this.favouritesRepository.delete(existing.id);
  }

  private async assertStudentCanWrite(studentId: string): Promise<void> {
    const user = await this.usersRepository.findById(studentId);
    if (!user) {
      throw new HttpError(401, "Sessão inválida.");
    }
    if (user.role !== "student") {
      throw new HttpError(403, "Apenas estudantes podem gerir favoritos.");
    }
    if (user.isBlocked) {
      throw new HttpError(403, "Conta bloqueada. Contacta o suporte.");
    }
  }
}
