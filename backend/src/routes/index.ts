import type { FastifyInstance } from "fastify";
import type { AdminListingsController } from "../controllers/admin-listings.controller.js";
import type { AuthController } from "../controllers/auth.controller.js";
import type { FavouritesController } from "../controllers/favourites.controller.js";
import type { ListingsController } from "../controllers/listings.controller.js";
import type { MessagingController } from "../controllers/messaging.controller.js";
import type { ProfileController } from "../controllers/profile.controller.js";
import type { ReportsController } from "../controllers/reports.controller.js";
import type { UploadController } from "../controllers/upload.controller.js";
import type { UsersController } from "../controllers/users.controller.js";
import type { MessagesHub } from "../services/messages-hub.js";
import type { MessagingService } from "../services/messaging.service.js";
import { adminListingsRoutes } from "./admin-listings.routes.js";
import { authRoutes } from "./auth.routes.js";
import { favouritesRoutes } from "./favourites.routes.js";
import { landlordListingsRoutes, listingsRoutes } from "./listings.routes.js";
import { messagingRoutes } from "./messaging.routes.js";
import { profileRoutes } from "./profile.routes.js";
import { adminReportsRoutes, reportsRoutes } from "./reports.routes.js";
import { uploadsRoutes } from "./uploads.routes.js";
import { usersRoutes } from "./users.routes.js";

interface RoutesDependencies {
  authController: AuthController;
  listingsController: ListingsController;
  adminListingsController: AdminListingsController;
  favouritesController: FavouritesController;
  messagingController: MessagingController;
  messagingService: MessagingService;
  messagesHub: MessagesHub;
  profileController: ProfileController;
  reportsController: ReportsController;
  uploadController: UploadController;
  usersController: UsersController;
}

export async function registerRoutes(app: FastifyInstance, deps: RoutesDependencies) {
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString()
  }));

  await app.register(async (authScope) => authRoutes(authScope, deps.authController), {
    prefix: "/auth"
  });

  await app.register(async (listingsScope) => listingsRoutes(listingsScope, deps.listingsController), {
    prefix: "/listings"
  });

  await app.register(
    async (landlordScope) => landlordListingsRoutes(landlordScope, deps.listingsController),
    { prefix: "/landlord" }
  );

  await app.register(async (favScope) => favouritesRoutes(favScope, deps.favouritesController), {
    prefix: "/favourites"
  });

  await app.register(
    async (msgScope) =>
      messagingRoutes(msgScope, deps.messagingController, deps.messagingService, deps.messagesHub),
    { prefix: "/conversations" }
  );

  await app.register(async (reportsScope) => reportsRoutes(reportsScope, deps.reportsController), {
    prefix: "/reports"
  });

  await app.register(
    async (adminReportsScope) => adminReportsRoutes(adminReportsScope, deps.reportsController),
    { prefix: "/admin/reports" }
  );

  await app.register(async (profileScope) => profileRoutes(profileScope, deps.profileController), {
    prefix: "/users"
  });

  await app.register(async (uploadsScope) => uploadsRoutes(uploadsScope, deps.uploadController), {
    prefix: "/uploads"
  });

  await app.register(async (usersScope) => usersRoutes(usersScope, deps.usersController), {
    prefix: "/admin/users"
  });

  await app.register(
    async (adminScope) => adminListingsRoutes(adminScope, deps.adminListingsController),
    { prefix: "/admin/listings" }
  );
}
