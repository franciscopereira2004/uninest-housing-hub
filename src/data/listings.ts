import type { Listing, Property, Room, SearchFilters } from "@/types";
import { seedListings, seedProperties, seedRooms } from "@/data/seed";

export function getListings(filters?: SearchFilters): Listing[] {
  let results = [...seedListings].filter((l) => l.status === "active");
  if (!filters) return results;

  if (filters.city) {
    const q = filters.city.toLowerCase().trim();
    if (q) results = results.filter((l) => l.city.toLowerCase().includes(q));
  }
  if (filters.minPrice != null) results = results.filter((l) => l.price >= filters.minPrice!);
  if (filters.maxPrice != null) results = results.filter((l) => l.price <= filters.maxPrice!);

  results = results.filter((l) => {
    const property = getProperty(l.propertyId);
    const room = getRoom(l.roomId);
    if (!property || !room) return false;
    if (filters.type && filters.type !== "any" && property.type !== filters.type) return false;
    if (filters.internet && !property.internetIncluded) return false;
    if (filters.furnished && !room.furnished) return false;
    if (filters.privateBathroom && !room.privateBathroom) return false;
    if (filters.availableFrom && room.availableFrom > filters.availableFrom) return false;
    return true;
  });

  return results;
}

export function getListing(id: string): Listing | undefined {
  return seedListings.find((l) => l.id === id);
}

export function getProperty(id: string): Property | undefined {
  return seedProperties.find((p) => p.id === id);
}

export function getRoom(id: string): Room | undefined {
  return seedRooms.find((r) => r.id === id);
}

export function getCities(): string[] {
  return Array.from(new Set(seedProperties.map((p) => p.city))).sort();
}
