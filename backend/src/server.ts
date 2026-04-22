import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function start() {
  let app: FastifyInstance | undefined;

  try {
    app = await buildApp();
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0"
    });
  } catch (error) {
    if (app) {
      app.log.error(error, "Database connection failed during startup.");
    } else {
      console.error("Database connection failed during startup.", error);
    }
    process.exit(1);
  }
}

void start();
