import { apiRequest } from "@/lib/api";
import type { Listing, SearchFilters } from "@/types";

interface DataResponse<T> {
  data: T;
}

const cache = {
  listings: [] as Listing[]
};

function buildSearchParams(filters?: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (!filters) return params;

  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.city) params.set("city", filters.city);
  if (filters.nearbyUniversity) params.set("nearbyUniversity", filters.nearbyUniversity);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.types && filters.types.length > 0) params.set("types", filters.types.join(","));
  if (filters.internet) params.set("internet", "1");
  if (filters.furnished) params.set("furnished", "1");
  if (filters.billsIncluded) params.set("billsIncluded", "1");
  if (filters.contractAvailable) params.set("contractAvailable", "1");
  if (filters.bedrooms != null) params.set("bedrooms", String(filters.bedrooms));
  if (filters.maxDistance != null) params.set("maxDistance", String(filters.maxDistance));
  if (filters.availableFrom) params.set("availableFrom", filters.availableFrom);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);

  return params;
}

export async function fetchListings(filters?: SearchFilters): Promise<Listing[]> {
  const params = buildSearchParams(filters);
  const query = params.toString();
  const endpoint = query ? `/listings?${query}` : "/listings";
  const response = await apiRequest<DataResponse<Listing[]>>(endpoint);
  cache.listings = response.data;
  return response.data;
}

export async function fetchListing(id: string): Promise<Listing> {
  const token = localStorage.getItem("uninest.token") ?? undefined;
  const response = await apiRequest<DataResponse<Listing>>(`/listings/${id}`, { token });
  return response.data;
}

export function getListings(): Listing[] {
  return cache.listings;
}

export function getCities(): string[] {
  return Array.from(new Set(cache.listings.map((l) => l.city))).sort();
}

export function getUniversities(): string[] {
  return Array.from(new Set(cache.listings.map((l) => l.nearbyUniversity))).sort();
}
