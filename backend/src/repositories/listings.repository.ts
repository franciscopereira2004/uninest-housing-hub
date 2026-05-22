import type { Container } from "@azure/cosmos";
import type { ListingEntity, ListingFilters, ListingStatus } from "../types/models.js";
import { seedListings } from "../data/seed.js";

export interface ListingsRepository {
  findPublic(filters: ListingFilters): Promise<ListingEntity[]>;
  findAll(filters: { status?: ListingStatus }): Promise<ListingEntity[]>;
  findByLandlord(landlordId: string): Promise<ListingEntity[]>;
  findById(id: string): Promise<ListingEntity | null>;
  findByIds(ids: string[]): Promise<ListingEntity[]>;
  upsert(listing: ListingEntity): Promise<ListingEntity>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
}

function applyPublicFilters(listings: ListingEntity[], filters: ListingFilters): ListingEntity[] {
  let results = listings.filter((l) => l.status === "approved");

  const keyword = filters.keyword?.trim().toLowerCase();
  if (keyword) {
    results = results.filter(
      (l) =>
        l.title.toLowerCase().includes(keyword) ||
        l.description.toLowerCase().includes(keyword) ||
        l.city.toLowerCase().includes(keyword) ||
        l.nearbyUniversity.toLowerCase().includes(keyword)
    );
  }

  if (filters.city) {
    const q = filters.city.trim().toLowerCase();
    if (q) results = results.filter((l) => l.city.toLowerCase().includes(q));
  }

  if (filters.nearbyUniversity) {
    const q = filters.nearbyUniversity.trim().toLowerCase();
    if (q) results = results.filter((l) => l.nearbyUniversity.toLowerCase().includes(q));
  }

  if (filters.minPrice != null) results = results.filter((l) => l.monthlyPrice >= filters.minPrice!);
  if (filters.maxPrice != null) results = results.filter((l) => l.monthlyPrice <= filters.maxPrice!);

  if (filters.types && filters.types.length > 0) {
    const allowed = new Set(filters.types);
    results = results.filter((l) => allowed.has(l.propertyType));
  }

  if (filters.internet) results = results.filter((l) => l.internetIncluded);
  if (filters.furnished) results = results.filter((l) => l.furnished);
  if (filters.billsIncluded) results = results.filter((l) => l.billsIncluded);
  if (filters.contractAvailable) results = results.filter((l) => l.contractAvailable);

  if (filters.bedrooms != null) results = results.filter((l) => l.bedrooms >= filters.bedrooms!);
  if (filters.maxDistance != null) results = results.filter((l) => l.distanceToUniversity <= filters.maxDistance!);

  if (filters.availableFrom) {
    results = results.filter((l) => l.availableFrom <= filters.availableFrom!);
  }

  const sortBy = filters.sortBy ?? "recent";
  results.sort((a, b) => {
    if (sortBy === "priceAsc") return a.monthlyPrice - b.monthlyPrice;
    if (sortBy === "priceDesc") return b.monthlyPrice - a.monthlyPrice;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return results;
}

export class InMemoryListingsRepository implements ListingsRepository {
  private listings: ListingEntity[];

  constructor() {
    this.listings = [...seedListings];
  }

  async findPublic(filters: ListingFilters): Promise<ListingEntity[]> {
    return applyPublicFilters(this.listings, filters);
  }

  async findAll(filters: { status?: ListingStatus }): Promise<ListingEntity[]> {
    let results = [...this.listings];
    if (filters.status) results = results.filter((l) => l.status === filters.status);
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findByLandlord(landlordId: string): Promise<ListingEntity[]> {
    return this.listings
      .filter((l) => l.landlordId === landlordId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<ListingEntity | null> {
    return this.listings.find((l) => l.id === id) ?? null;
  }

  async findByIds(ids: string[]): Promise<ListingEntity[]> {
    if (ids.length === 0) return [];
    const set = new Set(ids);
    return this.listings.filter((l) => set.has(l.id));
  }

  async upsert(listing: ListingEntity): Promise<ListingEntity> {
    const index = this.listings.findIndex((l) => l.id === listing.id);
    if (index >= 0) {
      this.listings[index] = listing;
    } else {
      this.listings.push(listing);
    }
    return listing;
  }

  async delete(id: string): Promise<void> {
    this.listings = this.listings.filter((l) => l.id !== id);
  }

  async incrementViews(id: string): Promise<void> {
    const listing = this.listings.find((l) => l.id === id);
    if (listing) listing.viewsCount = (listing.viewsCount ?? 0) + 1;
  }
}

export class CosmosListingsRepository implements ListingsRepository {
  constructor(private readonly container: Container) {}

  async findPublic(filters: ListingFilters): Promise<ListingEntity[]> {
    const conditions = ["c.status = 'approved'"];
    const parameters: Array<{ name: string; value: string | number | boolean }> = [];

    const keyword = filters.keyword?.trim().toLowerCase();
    if (keyword) {
      conditions.push(
        "(CONTAINS(LOWER(c.title), @kw) OR CONTAINS(LOWER(c.description), @kw) OR CONTAINS(LOWER(c.city), @kw) OR CONTAINS(LOWER(c.nearbyUniversity), @kw))"
      );
      parameters.push({ name: "@kw", value: keyword });
    }

    if (filters.city) {
      conditions.push("CONTAINS(LOWER(c.city), @city)");
      parameters.push({ name: "@city", value: filters.city.toLowerCase().trim() });
    }

    if (filters.nearbyUniversity) {
      conditions.push("CONTAINS(LOWER(c.nearbyUniversity), @univ)");
      parameters.push({ name: "@univ", value: filters.nearbyUniversity.toLowerCase().trim() });
    }

    if (filters.minPrice != null) {
      conditions.push("c.monthlyPrice >= @minPrice");
      parameters.push({ name: "@minPrice", value: filters.minPrice });
    }

    if (filters.maxPrice != null) {
      conditions.push("c.monthlyPrice <= @maxPrice");
      parameters.push({ name: "@maxPrice", value: filters.maxPrice });
    }

    if (filters.types && filters.types.length > 0) {
      const placeholders = filters.types.map((_, i) => `@type${i}`).join(",");
      conditions.push(`c.propertyType IN (${placeholders})`);
      filters.types.forEach((t, i) => parameters.push({ name: `@type${i}`, value: t }));
    }

    if (filters.internet) conditions.push("c.internetIncluded = true");
    if (filters.furnished) conditions.push("c.furnished = true");
    if (filters.billsIncluded) conditions.push("c.billsIncluded = true");
    if (filters.contractAvailable) conditions.push("c.contractAvailable = true");

    if (filters.bedrooms != null) {
      conditions.push("c.bedrooms >= @bedrooms");
      parameters.push({ name: "@bedrooms", value: filters.bedrooms });
    }

    if (filters.maxDistance != null) {
      conditions.push("c.distanceToUniversity <= @maxDist");
      parameters.push({ name: "@maxDist", value: filters.maxDistance });
    }

    if (filters.availableFrom) {
      conditions.push("c.availableFrom <= @availableFrom");
      parameters.push({ name: "@availableFrom", value: filters.availableFrom });
    }

    const orderClause =
      filters.sortBy === "priceAsc"
        ? "ORDER BY c.monthlyPrice ASC"
        : filters.sortBy === "priceDesc"
          ? "ORDER BY c.monthlyPrice DESC"
          : "ORDER BY c.createdAt DESC";

    const query = {
      query: `SELECT * FROM c WHERE ${conditions.join(" AND ")} ${orderClause}`,
      parameters
    };

    const { resources } = await this.container.items.query<ListingEntity>(query).fetchAll();
    return resources;
  }

  async findAll(filters: { status?: ListingStatus }): Promise<ListingEntity[]> {
    const conditions: string[] = [];
    const parameters: Array<{ name: string; value: string }> = [];
    if (filters.status) {
      conditions.push("c.status = @status");
      parameters.push({ name: "@status", value: filters.status });
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { resources } = await this.container.items
      .query<ListingEntity>({
        query: `SELECT * FROM c ${where} ORDER BY c.createdAt DESC`,
        parameters
      })
      .fetchAll();
    return resources;
  }

  async findByLandlord(landlordId: string): Promise<ListingEntity[]> {
    const { resources } = await this.container.items
      .query<ListingEntity>({
        query: "SELECT * FROM c WHERE c.landlordId = @landlordId ORDER BY c.createdAt DESC",
        parameters: [{ name: "@landlordId", value: landlordId }]
      })
      .fetchAll();
    return resources;
  }

  async findById(id: string): Promise<ListingEntity | null> {
    const { resources } = await this.container.items
      .query<ListingEntity>({
        query: "SELECT TOP 1 * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: id }]
      })
      .fetchAll();
    return resources[0] ?? null;
  }

  async findByIds(ids: string[]): Promise<ListingEntity[]> {
    if (ids.length === 0) return [];
    const placeholders = ids.map((_, i) => `@id${i}`).join(",");
    const parameters = ids.map((id, i) => ({ name: `@id${i}`, value: id }));
    const { resources } = await this.container.items
      .query<ListingEntity>({
        query: `SELECT * FROM c WHERE c.id IN (${placeholders})`,
        parameters
      })
      .fetchAll();
    return resources;
  }

  async upsert(listing: ListingEntity): Promise<ListingEntity> {
    const { resource } = await this.container.items.upsert<ListingEntity>(listing);
    return (resource as ListingEntity | undefined) ?? listing;
  }

  async delete(id: string): Promise<void> {
    try {
      await this.container.item(id, id).delete();
    } catch (err) {
      if ((err as { code?: number }).code === 404) return;
      throw err;
    }
  }

  async incrementViews(id: string): Promise<void> {
    const listing = await this.findById(id);
    if (!listing) return;
    listing.viewsCount = (listing.viewsCount ?? 0) + 1;
    await this.upsert(listing);
  }
}
