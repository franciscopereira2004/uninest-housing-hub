import { apiRequest } from "@/lib/api";
import type { User, UserRole } from "@/types";

const TOKEN_KEY = "uninest.token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

export type UserSortField = "name" | "email" | "role" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface ListUsersFilters {
  search?: string;
  role?: UserRole;
  sortBy?: UserSortField;
  sortDir?: SortDirection;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}

interface DataResponse<T> {
  data: T;
}

function buildQuery(filters: ListUsersFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listUsers(filters: ListUsersFilters): Promise<User[]> {
  const res = await apiRequest<DataResponse<User[]>>(`/admin/users${buildQuery(filters)}`, {
    token: getToken()
  });
  return res.data;
}

export async function getUser(id: string): Promise<User> {
  const res = await apiRequest<DataResponse<User>>(`/admin/users/${id}`, {
    token: getToken()
  });
  return res.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const res = await apiRequest<DataResponse<User>>(`/admin/users`, {
    method: "POST",
    body: payload,
    token: getToken()
  });
  return res.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const res = await apiRequest<DataResponse<User>>(`/admin/users/${id}`, {
    method: "PATCH",
    body: payload,
    token: getToken()
  });
  return res.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiRequest<unknown>(`/admin/users/${id}`, {
    method: "DELETE",
    token: getToken()
  });
}
