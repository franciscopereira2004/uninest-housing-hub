import type { FastifyInstance } from "fastify";
import type { ListingsController } from "../controllers/listings.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

export async function listingsRoutes(app: FastifyInstance, controller: ListingsController) {
  app.get("/", controller.list);
  app.get("/:id", controller.getById);
}

export async function landlordListingsRoutes(app: FastifyInstance, controller: ListingsController) {
  app.addHook("preHandler", authMiddleware);
  app.addHook("preHandler", requireRole(["landlord"]));

  app.get("/listings", controller.listMine);
  app.get("/listings/:id", controller.getMineById);
  app.post("/listings", controller.create);
  app.patch("/listings/:id", controller.update);
  app.delete("/listings/:id", controller.remove);
}
