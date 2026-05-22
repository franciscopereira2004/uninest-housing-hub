import type { FastifyInstance } from "fastify";
import type { AdminListingsController } from "../controllers/admin-listings.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

export async function adminListingsRoutes(app: FastifyInstance, controller: AdminListingsController) {
  app.addHook("preHandler", authMiddleware);
  app.addHook("preHandler", requireRole(["admin"]));

  app.get("/", controller.listAll);
  app.get("/pending", controller.listPending);
  app.get("/:id", controller.getById);
  app.patch("/:id/approve", controller.approve);
  app.patch("/:id/reject", controller.reject);
  app.patch("/:id/suspend", controller.suspend);
}
