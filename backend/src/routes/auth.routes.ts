import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import type { AuthController } from "../controllers/auth.controller.js";

export async function authRoutes(app: FastifyInstance, controller: AuthController) {
  const authRateLimit = { rateLimit: { max: 10, timeWindow: "1 minute" } };
  app.post("/register", { config: authRateLimit }, controller.register);
  app.post("/login", { config: authRateLimit }, controller.login);
  app.get("/me", { preHandler: authMiddleware }, controller.me);
}
