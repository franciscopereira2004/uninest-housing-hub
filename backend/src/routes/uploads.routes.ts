import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import type { UploadController } from "../controllers/upload.controller.js";

export async function uploadsRoutes(app: FastifyInstance, controller: UploadController) {
  app.post("/avatar", { preHandler: authMiddleware }, controller.uploadAvatar);
  app.post(
    "/listing-image",
    {
      preHandler: [authMiddleware, requireRole(["landlord", "admin"])]
    },
    controller.uploadListingImage
  );
  app.post(
    "/room-image",
    {
      preHandler: [authMiddleware, requireRole(["landlord", "admin"])]
    },
    controller.uploadRoomImage
  );
}
