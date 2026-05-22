import type { FastifyInstance } from "fastify";
import type { ReportsController } from "../controllers/reports.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

export async function reportsRoutes(app: FastifyInstance, controller: ReportsController) {
  // Authenticated users (any role) can create a report — service blocks reporting own listing/self
  app.register(async (auth) => {
    auth.addHook("preHandler", authMiddleware);
    auth.post(
      "/",
      { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
      controller.create
    );
  });
}

export async function adminReportsRoutes(app: FastifyInstance, controller: ReportsController) {
  app.addHook("preHandler", authMiddleware);
  app.addHook("preHandler", requireRole(["admin"]));

  app.get("/", controller.listAll);
  app.get("/counts", controller.counts);
  app.patch("/:id", controller.update);
}
