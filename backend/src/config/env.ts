import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendEnvPath = path.resolve(currentDir, "../../.env");

dotenv.config({ path: backendEnvPath });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
  USE_IN_MEMORY_DB: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  COSMOS_ENDPOINT: z.string().optional(),
  COSMOS_KEY: z.string().optional(),
  COSMOS_DATABASE_ID: z.string().default("uninest"),
  COSMOS_USERS_CONTAINER: z.string().default("users"),
  COSMOS_LISTINGS_CONTAINER: z.string().default("listings"),
  BLOB_CONNECTION_STRING: z.string().optional(),
  BLOB_AVATARS_CONTAINER: z.string().default("avatars"),
  BLOB_ROOM_IMAGES_CONTAINER: z.string().default("room-images"),
  BLOB_PROPERTY_IMAGES_CONTAINER: z.string().default("property-images"),
  BLOB_USE_MOCK: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  BLOB_MOCK_BASE_URL: z.string().default("https://example.blob.core.windows.net"),
  JWT_SECRET: z.string().default("change-me-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(5)
});

export const env = envSchema.parse(process.env);
