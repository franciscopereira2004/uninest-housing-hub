import type { FastifyInstance } from "fastify";
import type { AuthController } from "../controllers/auth.controller.js";
import type { ListingsController } from "../controllers/listings.controller.js";
import type { UploadController } from "../controllers/upload.controller.js";
import { authRoutes } from "./auth.routes.js";
import { listingsRoutes } from "./listings.routes.js";
import { uploadsRoutes } from "./uploads.routes.js";

interface RoutesDependencies {
  authController: AuthController;
  listingsController: ListingsController;
  uploadController: UploadController;
}

export async function registerRoutes(app: FastifyInstance, deps: RoutesDependencies) {
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString()
  }));

  await app.register(async (authScope) => authRoutes(authScope, deps.authController), {
    prefix: "/auth"
  });

  await app.register(async (listingsScope) => listingsRoutes(listingsScope, deps.listingsController), {
    prefix: "/listings"
  });

  await app.register(async (uploadsScope) => uploadsRoutes(uploadsScope, deps.uploadController), {
    prefix: "/uploads"
  });
}
