import type { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../utils/http-error.js";

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    throw new HttpError(401, "Token inválido ou em falta.");
  }
}
