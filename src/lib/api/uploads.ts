import { ApiError, getApiBaseUrl } from "@/lib/api";

const TOKEN_KEY = "uninest.token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE_MB = 5;

function validateImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new ApiError("Tipo de ficheiro inválido. Usa JPG, PNG ou WEBP.", 400);
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    throw new ApiError(`A imagem excede ${MAX_IMAGE_SIZE_MB}MB.`, 400);
  }
}

async function uploadImage(path: string, file: File): Promise<{ url: string }> {
  validateImage(file);
  const token = getToken();
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/uploads/${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form
  });

  const payload = (await response.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!response.ok) {
    throw new ApiError(payload.message ?? "Erro ao carregar imagem.", response.status);
  }
  if (!payload.url) {
    throw new ApiError("Resposta inválida do servidor.", 500);
  }
  return { url: payload.url };
}

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  return uploadImage("avatar", file);
}

export async function uploadListingImage(file: File): Promise<{ url: string }> {
  return uploadImage("listing-image", file);
}
