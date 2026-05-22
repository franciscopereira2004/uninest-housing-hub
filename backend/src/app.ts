import Fastify from "fastify";
import { assertBlobReady, createBlobContext } from "./config/blob.js";
import { assertCosmosReady, createCosmosContext } from "./config/cosmos.js";
import { env } from "./config/env.js";
import { AdminListingsController } from "./controllers/admin-listings.controller.js";
import { AuthController } from "./controllers/auth.controller.js";
import { FavouritesController } from "./controllers/favourites.controller.js";
import { ListingsController } from "./controllers/listings.controller.js";
import { MessagingController } from "./controllers/messaging.controller.js";
import { ProfileController } from "./controllers/profile.controller.js";
import { ReportsController } from "./controllers/reports.controller.js";
import { UploadController } from "./controllers/upload.controller.js";
import { UsersController } from "./controllers/users.controller.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { registerPlugins } from "./plugins/register-plugins.js";
import {
  CosmosConversationsRepository,
  InMemoryConversationsRepository
} from "./repositories/conversations.repository.js";
import {
  CosmosFavouritesRepository,
  InMemoryFavouritesRepository
} from "./repositories/favourites.repository.js";
import {
  CosmosListingsRepository,
  InMemoryListingsRepository
} from "./repositories/listings.repository.js";
import {
  CosmosMessagesRepository,
  InMemoryMessagesRepository
} from "./repositories/messages.repository.js";
import {
  CosmosReportsRepository,
  InMemoryReportsRepository
} from "./repositories/reports.repository.js";
import {
  CosmosUsersRepository,
  InMemoryUsersRepository
} from "./repositories/users.repository.js";
import { registerRoutes } from "./routes/index.js";
import { AdminListingsService } from "./services/admin-listings.service.js";
import { AuthService } from "./services/auth.service.js";
import { FavouritesService } from "./services/favourites.service.js";
import { ListingsService } from "./services/listings.service.js";
import { MessagesHub } from "./services/messages-hub.js";
import { MessagingService } from "./services/messaging.service.js";
import { ReportsService } from "./services/reports.service.js";
import { UploadService } from "./services/upload.service.js";
import { UsersService } from "./services/users.service.js";

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== "test"
  });

  await registerPlugins(app);

  const cosmos = createCosmosContext();
  const blob = createBlobContext();

  if (cosmos) {
    const bootstrap = await assertCosmosReady(cosmos);
    app.log.info("Database connection established (Cosmos DB).");
    if (bootstrap.databaseCreated || bootstrap.containersCreated.length > 0) {
      app.log.info(
        `Cosmos bootstrap: databaseCreated=${bootstrap.databaseCreated}, containersCreated=[${bootstrap.containersCreated.join(",")}]`
      );
    }
  } else {
    app.log.info("Database connection running in memory mode.");
  }

  if (blob) {
    await assertBlobReady(blob);
    app.log.info("Blob storage ready (containers with public read access).");
  } else {
    app.log.info("Blob storage running in mock mode.");
  }

  const usersRepository = cosmos
    ? new CosmosUsersRepository(cosmos.containers.users)
    : new InMemoryUsersRepository();
  const listingsRepository = cosmos
    ? new CosmosListingsRepository(cosmos.containers.listings)
    : new InMemoryListingsRepository();
  const favouritesRepository = cosmos
    ? new CosmosFavouritesRepository(cosmos.containers.favourites)
    : new InMemoryFavouritesRepository();
  const conversationsRepository = cosmos
    ? new CosmosConversationsRepository(cosmos.containers.conversations)
    : new InMemoryConversationsRepository();
  const messagesRepository = cosmos
    ? new CosmosMessagesRepository(cosmos.containers.messages)
    : new InMemoryMessagesRepository();
  const reportsRepository = cosmos
    ? new CosmosReportsRepository(cosmos.containers.reports)
    : new InMemoryReportsRepository();

  // (reportsRepository wired below via ReportsService)

  const authService = new AuthService(usersRepository, app);
  await authService.ensureDefaultLogins();
  const usersService = new UsersService(usersRepository);
  const listingsService = new ListingsService(listingsRepository, usersRepository);
  const seededListings = await listingsService.ensureSeedListings();
  if (seededListings > 0) {
    app.log.info(`Seeded ${seededListings} listing(s) into the database.`);
  }
  const adminListingsService = new AdminListingsService(listingsRepository);
  const favouritesService = new FavouritesService(
    favouritesRepository,
    listingsRepository,
    usersRepository
  );
  const messagesHub = new MessagesHub();
  const messagingService = new MessagingService(
    conversationsRepository,
    messagesRepository,
    listingsRepository,
    usersRepository,
    messagesHub
  );
  const reportsService = new ReportsService(
    reportsRepository,
    listingsRepository,
    usersRepository,
    adminListingsService,
    usersService
  );
  const uploadService = new UploadService(blob);

  const authController = new AuthController(authService);
  const listingsController = new ListingsController(listingsService, usersService);
  const adminListingsController = new AdminListingsController(adminListingsService);
  const favouritesController = new FavouritesController(favouritesService);
  const messagingController = new MessagingController(messagingService);
  const profileController = new ProfileController(usersService);
  const reportsController = new ReportsController(reportsService);
  const uploadController = new UploadController(uploadService);
  const usersController = new UsersController(usersService);

  app.setErrorHandler(errorHandler);

  await registerRoutes(app, {
    authController,
    listingsController,
    adminListingsController,
    favouritesController,
    messagingController,
    messagingService,
    messagesHub,
    profileController,
    reportsController,
    uploadController,
    usersController
  });

  return app;
}
