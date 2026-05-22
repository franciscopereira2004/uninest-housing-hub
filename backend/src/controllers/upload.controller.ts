import type { FastifyReply, FastifyRequest } from "fastify";
import type { UploadService } from "../services/upload.service.js";
import { HttpError } from "../utils/http-error.js";

export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  uploadAvatar = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.user as { sub: string }).sub;
    const file = await request.file();
    if (!file) {
      throw new HttpError(400, "Ficheiro em falta.");
    }

    const result = await this.uploadService.uploadAvatar(userId, file);
    return reply.status(201).send(result);
  };

  uploadListingImage = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.user as { sub: string }).sub;
    const file = await request.file();
    if (!file) {
      throw new HttpError(400, "Ficheiro em falta.");
    }
    const result = await this.uploadService.uploadListingImage(userId, file);
    return reply.status(201).send(result);
  };

  uploadRoomImage = async (request: FastifyRequest, reply: FastifyReply) => {
    let roomId: string | undefined;
    let uploadedFile: Awaited<ReturnType<FastifyRequest["file"]>> | undefined;

    for await (const part of request.parts()) {
      if (part.type === "field" && part.fieldname === "roomId") {
        roomId = String(part.value);
      }
      if (part.type === "file" && part.fieldname === "file") {
        uploadedFile = part;
      }
    }

    if (!roomId) {
      throw new HttpError(400, "roomId é obrigatório.");
    }
    if (!uploadedFile) {
      throw new HttpError(400, "Ficheiro em falta no campo 'file'.");
    }

    const result = await this.uploadService.uploadRoomImage(roomId, uploadedFile);
    return reply.status(201).send(result);
  };
}
