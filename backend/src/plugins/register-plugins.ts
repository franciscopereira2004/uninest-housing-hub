import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

export async function registerPlugins(app: FastifyInstance) {
  await app.register(cors, {
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
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

  await app.register(websocket);

  await app.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: "1 minute"
  });
}
