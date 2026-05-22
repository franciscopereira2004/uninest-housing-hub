import type { FastifyInstance } from "fastify";
import type { UsersController } from "../controllers/users.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

export async function usersRoutes(app: FastifyInstance, controller: UsersController) {
  app.addHook("preHandler", authMiddleware);
  app.addHook("preHandler", requireRole(["admin"]));

  app.get("/", controller.list);
  app.get("/:id", controller.getById);
  app.post("/", controller.create);
  app.patch("/:id", controller.update);
  app.patch("/:id/block", controller.setBlocked);
  app.delete("/:id", controller.delete);
}
