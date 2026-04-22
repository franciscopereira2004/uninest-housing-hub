import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import type { AuthController } from "../controllers/auth.controller.js";

export async function authRoutes(app: FastifyInstance, controller: AuthController) {
  app.post("/register", controller.register);
  app.post("/login", controller.login);
  app.get("/me", { preHandler: authMiddleware }, controller.me);
}
