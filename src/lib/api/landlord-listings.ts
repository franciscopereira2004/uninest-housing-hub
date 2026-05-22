import { apiRequest } from "@/lib/api";
import type { Listing, ListingImage, PropertyType } from "@/types";

const TOKEN_KEY = "uninest.token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

interface DataResponse<T> {
  data: T;
}

export interface ListingPayload {
  title: string;
  description: string;
  propertyType: PropertyType;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  nearbyUniversity: string;
  distanceToUniversity: number;
  monthlyPrice: number;
  depositAmount: number;
  billsIncluded: boolean;
  availableFrom: string;
  minimumStay: number;
  maxTenants: number;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  internetIncluded: boolean;
  contractAvailable: boolean;
  houseRules: string[];
  amenities: string[];
  images: ListingImage[];
}

export async function listMyListings(): Promise<Listing[]> {
  const res = await apiRequest<DataResponse<Listing[]>>("/landlord/listings", { token: getToken() });
  return res.data;
}

export async function getMyListing(id: string): Promise<Listing> {
  const res = await apiRequest<DataResponse<Listing>>(`/landlord/listings/${id}`, { token: getToken() });
  return res.data;
}

export async function createMyListing(payload: ListingPayload): Promise<Listing> {
  const res = await apiRequest<DataResponse<Listing>>("/landlord/listings", {
    method: "POST",
    body: payload,
    token: getToken()
  });
  return res.data;
}

export async function updateMyListing(id: string, payload: Partial<ListingPayload>): Promise<Listing> {
  const res = await apiRequest<DataResponse<Listing>>(`/landlord/listings/${id}`, {
    method: "PATCH",
    body: payload,
    token: getToken()
  });
  return res.data;
}

export async function deleteMyListing(id: string): Promise<void> {
  await apiRequest<unknown>(`/landlord/listings/${id}`, {
    method: "DELETE",
    token: getToken()
  });
}
