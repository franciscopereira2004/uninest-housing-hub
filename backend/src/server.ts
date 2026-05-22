import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.js";
import { env } from "./config/env.js";

function getDatabaseModeLabel() {
  return env.USE_IN_MEMORY_DB ? "in-memory" : `cosmos (${env.COSMOS_DATABASE_ID})`;
}

function getBlobModeLabel() {
  return env.BLOB_USE_MOCK ? "mock" : "azure-blob";
}

const port = Number(env.PORT) || 4000;

function formatStartupError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "[startup] Failed to initialize backend server.";
  }

  const message = error.message?.trim() ?? "";
  if (message.includes("CONFIGURATION ERROR")) {
    return message;
  }

  return `[startup] Failed to initialize backend server.\n${message}`;
}

async function start() {
  let app: FastifyInstance | undefined;

  try {
    console.info("[startup] Initializing backend server...");
    app = await buildApp();
    await app.listen({
      port,
      host: "0.0.0.0"
    });
    app.log.info(
      `[startup] Server ready on port ${env.PORT} | database=${getDatabaseModeLabel()} | blob=${getBlobModeLabel()}`
    );
  } catch (error) {
    if (app) {
      app.log.error(error, "[startup] Failed to initialize backend server.");
    } else {
      console.error(formatStartupError(error));
    }
    process.exit(1);
  }
}

void start();
