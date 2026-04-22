import Fastify from "fastify";
import { createBlobContext } from "./config/blob.js";
import { createCosmosContext } from "./config/cosmos.js";
import { env } from "./config/env.js";
import { AuthController } from "./controllers/auth.controller.js";
import { ListingsController } from "./controllers/listings.controller.js";
import { UploadController } from "./controllers/upload.controller.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { registerPlugins } from "./plugins/register-plugins.js";
import {
  CosmosListingsRepository,
  InMemoryListingsRepository
} from "./repositories/listings.repository.js";
import {
  CosmosUsersRepository,
  InMemoryUsersRepository
} from "./repositories/users.repository.js";
import { registerRoutes } from "./routes/index.js";
import { AuthService } from "./services/auth.service.js";
import { ListingsService } from "./services/listings.service.js";
import { UploadService } from "./services/upload.service.js";

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== "test"
  });

  await registerPlugins(app);

  const cosmos = createCosmosContext();
  const blob = createBlobContext();

  const usersRepository = cosmos
    ? new CosmosUsersRepository(cosmos.containers.users)
    : new InMemoryUsersRepository();
  const listingsRepository = cosmos
    ? new CosmosListingsRepository(cosmos.containers.listings)
    : new InMemoryListingsRepository();

  const authService = new AuthService(usersRepository, app);
  const listingsService = new ListingsService(listingsRepository);
  const uploadService = new UploadService(blob);

  const authController = new AuthController(authService);
  const listingsController = new ListingsController(listingsService);
  const uploadController = new UploadController(uploadService);

  await registerRoutes(app, {
    authController,
    listingsController,
    uploadController
  });

  app.setErrorHandler(errorHandler);
  return app;
}
