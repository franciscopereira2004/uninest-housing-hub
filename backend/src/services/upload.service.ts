import { randomUUID } from "node:crypto";
import type { MultipartFile } from "@fastify/multipart";
import type { BlobContext } from "../config/blob.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

export class UploadService {
  constructor(private readonly blobContext: BlobContext | null) {}

  async uploadAvatar(userId: string, file: MultipartFile): Promise<{ url: string }> {
    return this.uploadFile({
      container: env.BLOB_AVATARS_CONTAINER,
      path: `${userId}/${randomUUID()}-${sanitizeFilename(file.filename)}`,
      file
    });
  }

  async uploadRoomImage(roomId: string, file: MultipartFile): Promise<{ url: string }> {
    return this.uploadFile({
      container: env.BLOB_ROOM_IMAGES_CONTAINER,
      path: `${roomId}/${randomUUID()}-${sanitizeFilename(file.filename)}`,
      file
    });
  }

  async uploadListingImage(userId: string, file: MultipartFile): Promise<{ url: string }> {
    return this.uploadFile({
      container: env.BLOB_PROPERTY_IMAGES_CONTAINER,
      path: `${userId}/${randomUUID()}-${sanitizeFilename(file.filename)}`,
      file
    });
  }

  private async uploadFile({
    container,
    path,
    file
  }: {
    container: string;
    path: string;
    file: MultipartFile;
  }): Promise<{ url: string }> {
    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new HttpError(400, "Tipo de ficheiro inválido. Usa JPG, PNG ou WEBP.");
    }

    const buffer = await file.toBuffer();
    const maxSize = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
    if (buffer.byteLength > maxSize) {
      throw new HttpError(400, `A imagem excede ${env.MAX_UPLOAD_SIZE_MB}MB.`);
    }

    if (!this.blobContext) {
      return {
        url: `${env.BLOB_MOCK_BASE_URL}/${container}/${path}`
      };
    }

    const targetContainer =
      container === env.BLOB_AVATARS_CONTAINER
        ? this.blobContext.avatars
        : container === env.BLOB_ROOM_IMAGES_CONTAINER
          ? this.blobContext.roomImages
          : this.blobContext.propertyImages;

    await targetContainer.createIfNotExists({ access: "blob" });
    const blockBlobClient = targetContainer.getBlockBlobClient(path);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype
      }
    });

    return { url: blockBlobClient.url };
  }
}
