import type { FastifyInstance } from "fastify";
import type { FavouritesController } from "../controllers/favourites.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

export async function favouritesRoutes(app: FastifyInstance, controller: FavouritesController) {
  app.addHook("preHandler", authMiddleware);
  app.addHook("preHandler", requireRole(["student"]));

  app.get("/", controller.list);
  app.post("/:listingId", controller.add);
  app.delete("/:listingId", controller.remove);
}
