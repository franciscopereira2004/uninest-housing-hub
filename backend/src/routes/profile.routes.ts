import type { FastifyInstance } from "fastify";
import type { ProfileController } from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export async function profileRoutes(app: FastifyInstance, controller: ProfileController) {
  app.addHook("preHandler", authMiddleware);

  app.get("/me", controller.me);
  app.patch("/me", controller.updateMe);
  app.post("/me/password", controller.changePassword);
}
