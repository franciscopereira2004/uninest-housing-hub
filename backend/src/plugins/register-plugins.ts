import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

export async function registerPlugins(app: FastifyInstance) {
  await app.register(cors, {
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN
    }
  });

  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
      files: 1
    }
  });
}
