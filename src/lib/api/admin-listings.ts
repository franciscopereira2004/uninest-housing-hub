import { apiRequest } from "@/lib/api";
import type { Listing, ListingStatus } from "@/types";

const TOKEN_KEY = "uninest.token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

interface DataResponse<T> {
  data: T;
}

export async function listAllListings(filters?: { status?: ListingStatus }): Promise<Listing[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  const qs = params.toString();
  const res = await apiRequest<DataResponse<Listing[]>>(
    `/admin/listings${qs ? `?${qs}` : ""}`,
    { token: getToken() }
  );
  return res.data;
}

export async function listPendingListings(): Promise<Listing[]> {
  const res = await apiRequest<DataResponse<Listing[]>>("/admin/listings/pending", {
    token: getToken()
  });
  return res.data;
}

export async function getAdminListing(id: string): Promise<Listing> {
  const res = await apiRequest<DataResponse<Listing>>(`/admin/listings/${id}`, {
    token: getToken()
  });
  return res.data;
}

export async function approveListing(id: string): Promise<Listing> {
  const res = await apiRequest<DataResponse<Listing>>(`/admin/listings/${id}/approve`, {
    method: "PATCH",
    token: getToken()
  });
  return res.data;
}

export async function rejectListing(id: string, reason: string): Promise<Listing> {
  const res = await apiRequest<DataResponse<Listing>>(`/admin/listings/${id}/reject`, {
    method: "PATCH",
    body: { reason },
    token: getToken()
  });
  return res.data;
}

export async function suspendListing(id: string): Promise<Listing> {
  const res = await apiRequest<DataResponse<Listing>>(`/admin/listings/${id}/suspend`, {
    method: "PATCH",
    token: getToken()
  });
  return res.data;
}
