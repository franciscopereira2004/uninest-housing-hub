import { apiRequest } from "@/lib/api";
import { seedListings, seedProperties, seedRooms } from "@/data/seed";
import type { Listing, Property, Room, SearchFilters } from "@/types";

interface ListingsResponse {
  data: Listing[];
}

interface ListingResponse {
  data: Listing;
}

const cache = {
  listings: [...seedListings] as Listing[],
};

function buildSearchParams(filters?: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (!filters) return params;

  if (filters.city) params.set("city", filters.city);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.type && filters.type !== "any") params.set("type", filters.type);
  if (filters.internet) params.set("internet", "1");
  if (filters.furnished) params.set("furnished", "1");
  if (filters.privateBathroom) params.set("privateBathroom", "1");
  if (filters.availableFrom) params.set("availableFrom", filters.availableFrom);

  return params;
}

export async function fetchListings(filters?: SearchFilters): Promise<Listing[]> {
  const params = buildSearchParams(filters);
  const query = params.toString();
  const endpoint = query ? `/listings?${query}` : "/listings";
  const response = await apiRequest<ListingsResponse>(endpoint);
  cache.listings = response.data;
  return response.data;
}

export async function fetchListing(id: string): Promise<Listing | undefined> {
  const response = await apiRequest<ListingResponse>(`/listings/${id}`);
  return response.data;
}

export function getListings(filters?: SearchFilters): Listing[] {
  if (!filters) return cache.listings;
  let results = [...cache.listings];
  if (filters.city) {
    const q = filters.city.toLowerCase().trim();
    if (q) results = results.filter((l) => l.city.toLowerCase().includes(q));
  }
  if (filters.minPrice != null) results = results.filter((l) => l.price >= filters.minPrice);
  if (filters.maxPrice != null) results = results.filter((l) => l.price <= filters.maxPrice);
  return results;
}

export function getListing(id: string): Listing | undefined {
  return cache.listings.find((l) => l.id === id);
}

export function getProperty(id: string): Property | undefined {
  return seedProperties.find((p) => p.id === id);
}

export function getRoom(id: string): Room | undefined {
  return seedRooms.find((r) => r.id === id);
}

export function getCities(): string[] {
  return Array.from(new Set(cache.listings.map((l) => l.city))).sort();
}
