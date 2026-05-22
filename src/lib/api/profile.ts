import { apiRequest } from "@/lib/api";
import type { LandlordProfile, StudentProfile, User } from "@/types";

const TOKEN_KEY = "uninest.token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

interface DataResponse<T> {
  data: T;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  studentProfile?: StudentProfile;
  landlordProfile?: LandlordProfile;
}

export async function fetchMe(): Promise<User> {
  const res = await apiRequest<DataResponse<User>>("/users/me", { token: getToken() });
  return res.data;
}

export async function updateMe(payload: UpdateProfilePayload): Promise<User> {
  const res = await apiRequest<DataResponse<User>>("/users/me", {
    method: "PATCH",
    body: payload,
    token: getToken()
  });
  return res.data;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changeMyPassword(payload: ChangePasswordPayload): Promise<void> {
  await apiRequest<DataResponse<{ ok: true }>>("/users/me/password", {
    method: "POST",
    body: payload,
    token: getToken()
  });
}
