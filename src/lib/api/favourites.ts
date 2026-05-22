import { apiRequest } from "@/lib/api";
import type { Listing } from "@/types";

const TOKEN_KEY = "uninest.token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

export interface FavouriteListing {
  favouriteId: string;
  favouritedAt: string;
  listing: Listing;
}

interface DataResponse<T> {
  data: T;
}

export async function listFavourites(): Promise<FavouriteListing[]> {
  const res = await apiRequest<DataResponse<FavouriteListing[]>>("/favourites", {
    token: getToken()
  });
  return res.data;
}

export async function addFavourite(listingId: string): Promise<void> {
  await apiRequest<unknown>(`/favourites/${listingId}`, {
    method: "POST",
    token: getToken()
  });
}

export async function removeFavourite(listingId: string): Promise<void> {
  await apiRequest<unknown>(`/favourites/${listingId}`, {
    method: "DELETE",
    token: getToken()
  });
}
