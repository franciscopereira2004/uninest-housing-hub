import type { Container } from "@azure/cosmos";
import type { ListingEntity, ListingFilters } from "../types/models.js";
import { seedListings } from "../data/seed.js";

export interface ListingsRepository {
  findAll(filters: ListingFilters): Promise<ListingEntity[]>;
  findById(id: string): Promise<ListingEntity | null>;
}

export class InMemoryListingsRepository implements ListingsRepository {
  private listings: ListingEntity[];

  constructor() {
    this.listings = [...seedListings];
  }

  async findAll(filters: ListingFilters): Promise<ListingEntity[]> {
    let results = this.listings.filter((listing) => listing.status === "active");

    if (filters.city) {
      const q = filters.city.trim().toLowerCase();
      if (q) {
        results = results.filter((listing) => listing.city.toLowerCase().includes(q));
      }
    }

    if (filters.minPrice != null) {
      results = results.filter((listing) => listing.price >= filters.minPrice!);
    }

    if (filters.maxPrice != null) {
      results = results.filter((listing) => listing.price <= filters.maxPrice!);
    }

    if (filters.type && filters.type !== "any") {
      results = results.filter((listing) => listing.propertyType === filters.type);
    }

    if (filters.internet) {
      results = results.filter((listing) => listing.internetIncluded);
    }

    if (filters.furnished) {
      results = results.filter((listing) => listing.furnished);
    }

    if (filters.privateBathroom) {
      results = results.filter((listing) => listing.privateBathroom);
    }

    if (filters.availableFrom) {
      results = results.filter((listing) => listing.availableFrom <= filters.availableFrom!);
    }

    return results;
  }

  async findById(id: string): Promise<ListingEntity | null> {
    return this.listings.find((listing) => listing.id === id) ?? null;
  }
}

export class CosmosListingsRepository implements ListingsRepository {
  constructor(private readonly container: Container) {}

  async findAll(filters: ListingFilters): Promise<ListingEntity[]> {
    const conditions = ["c.status = 'active'"];
    const parameters: Array<{ name: string; value: string | number | boolean }> = [];

    if (filters.city) {
      conditions.push("CONTAINS(LOWER(c.city), @city)");
      parameters.push({ name: "@city", value: filters.city.toLowerCase().trim() });
    }

    if (filters.minPrice != null) {
      conditions.push("c.price >= @minPrice");
      parameters.push({ name: "@minPrice", value: filters.minPrice });
    }

    if (filters.maxPrice != null) {
      conditions.push("c.price <= @maxPrice");
      parameters.push({ name: "@maxPrice", value: filters.maxPrice });
    }

    if (filters.type && filters.type !== "any") {
      conditions.push("c.propertyType = @type");
      parameters.push({ name: "@type", value: filters.type });
    }

    if (filters.internet) {
      conditions.push("c.internetIncluded = true");
    }

    if (filters.furnished) {
      conditions.push("c.furnished = true");
    }

    if (filters.privateBathroom) {
      conditions.push("c.privateBathroom = true");
    }

    if (filters.availableFrom) {
      conditions.push("c.availableFrom <= @availableFrom");
      parameters.push({ name: "@availableFrom", value: filters.availableFrom });
    }

    const query = {
      query: `SELECT * FROM c WHERE ${conditions.join(" AND ")} ORDER BY c.createdAt DESC`,
      parameters
    };

    const { resources } = await this.container.items.query<ListingEntity>(query).fetchAll();
    return resources;
  }

  async findById(id: string): Promise<ListingEntity | null> {
    const query = {
      query: "SELECT TOP 1 * FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: id }]
    };
    const { resources } = await this.container.items.query<ListingEntity>(query).fetchAll();
    return resources[0] ?? null;
  }
}
