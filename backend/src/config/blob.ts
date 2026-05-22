import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";
import { env } from "./env.js";

export interface BlobContext {
  avatars: ContainerClient;
  roomImages: ContainerClient;
  propertyImages: ContainerClient;
}

export function createBlobContext(): BlobContext | null {
  if (env.BLOB_USE_MOCK) {
    return null;
  }

  if (!env.BLOB_CONNECTION_STRING) {
    throw new Error("BLOB_CONNECTION_STRING é obrigatório quando BLOB_USE_MOCK=false.");
  }

  const value = env.BLOB_CONNECTION_STRING.trim();
  const seemsAzureConnectionString =
    value.includes("AccountName=") &&
    value.includes("AccountKey=") &&
    value.includes("DefaultEndpointsProtocol=");
  const seemsUrl = /^https?:\/\//i.test(value);

  if (!seemsAzureConnectionString || seemsUrl) {
    throw new Error(
      [
        "",
        "############################# CONFIGURATION ERROR #############################",
        "Blob Storage não arrancou: BLOB_CONNECTION_STRING inválido.",
        "",
        "Valor esperado: Azure Storage connection string completa.",
        "Exemplo: DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net",
        "",
        "O que tens provavelmente agora: URL/SAS (https://...).",
        "Uma URL não funciona com BlobServiceClient.fromConnectionString(...).",
        "",
        "Como corrigir:",
        "1) Azure Portal -> Storage Account -> Access keys",
        "2) Copia a 'Connection string'",
        "3) Atualiza backend/.env (BLOB_CONNECTION_STRING=...)",
        "4) Reinicia o backend/container",
        "###############################################################################"
      ].join("\n")
    );
  }

  let blobService: BlobServiceClient;
  try {
    blobService = BlobServiceClient.fromConnectionString(value);
  } catch {
    throw new Error(
      [
        "",
        "############################# CONFIGURATION ERROR #############################",
        "Não foi possível inicializar o Azure Blob Storage.",
        "BLOB_CONNECTION_STRING existe, mas está num formato inválido.",
        "Confirma se é a connection string completa (Access keys), sem truncar.",
        "###############################################################################"
      ].join("\n")
    );
  }

  return {
    avatars: blobService.getContainerClient(env.BLOB_AVATARS_CONTAINER),
    roomImages: blobService.getContainerClient(env.BLOB_ROOM_IMAGES_CONTAINER),
    propertyImages: blobService.getContainerClient(env.BLOB_PROPERTY_IMAGES_CONTAINER)
  };
}

/**
 * Ensure each container exists and has blob-level public read access, so that
 * `<img src="https://account.blob.core.windows.net/container/file.jpg">` works
 * without SAS tokens. Safe to call repeatedly.
 */
export async function assertBlobReady(blob: BlobContext): Promise<void> {
  for (const container of [blob.avatars, blob.roomImages, blob.propertyImages]) {
    await container.createIfNotExists({ access: "blob" });
    try {
      await container.setAccessPolicy("blob");
    } catch {
      // already set with same policy — Azure returns ConditionNotMet, safe to ignore
    }
  }
}
