import type { FastifyInstance } from "fastify";
import type { ListingsController } from "../controllers/listings.controller.js";

export async function listingsRoutes(app: FastifyInstance, controller: ListingsController) {
  app.get("/", controller.list);
  app.get("/:id", controller.getById);
}
