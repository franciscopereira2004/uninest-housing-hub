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

  const blobService = BlobServiceClient.fromConnectionString(env.BLOB_CONNECTION_STRING);

  return {
    avatars: blobService.getContainerClient(env.BLOB_AVATARS_CONTAINER),
    roomImages: blobService.getContainerClient(env.BLOB_ROOM_IMAGES_CONTAINER),
    propertyImages: blobService.getContainerClient(env.BLOB_PROPERTY_IMAGES_CONTAINER)
  };
}
