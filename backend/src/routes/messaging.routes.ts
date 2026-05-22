import type { FastifyInstance } from "fastify";
import type { MessagingController } from "../controllers/messaging.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import type { MessagesHub } from "../services/messages-hub.js";
import type { MessagingService } from "../services/messaging.service.js";

export async function messagingRoutes(
  app: FastifyInstance,
  controller: MessagingController,
  service: MessagingService,
  hub: MessagesHub
) {
  // REST endpoints — require auth via Authorization header
  app.register(async (rest) => {
    rest.addHook("preHandler", authMiddleware);
    rest.get("/", controller.list);
    rest.post(
      "/",
      { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
      controller.start
    );
    rest.get("/:id", controller.getById);
    rest.get("/:id/messages", controller.listMessages);
    rest.post(
      "/:id/messages",
      { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
      controller.sendMessage
    );
  });

  // WebSocket — auth via ?token= query param (browsers can't set headers on WS)
  app.get<{ Params: { id: string }; Querystring: { token?: string } }>(
    "/:id/ws",
    { websocket: true },
    async (socket, request) => {
      const token = request.query?.token;
      if (!token) {
        socket.send(JSON.stringify({ type: "error", message: "Missing token." }));
        socket.close();
        return;
      }

      let userId: string;
      try {
        const decoded = await app.jwt.verify<{ sub: string }>(token);
        userId = decoded.sub;
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "Invalid token." }));
        socket.close();
        return;
      }

      const conversationId = request.params.id;
      try {
        await service.getConversation(userId, conversationId);
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "Conversation not accessible." }));
        socket.close();
        return;
      }

      const unsubscribe = hub.subscribe(conversationId, { socket, userId });
      socket.send(JSON.stringify({ type: "ready" }));
      socket.on("close", unsubscribe);
      socket.on("error", unsubscribe);
    }
  );
}
