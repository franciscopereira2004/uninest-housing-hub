import { CosmosClient, type Container } from "@azure/cosmos";
import { env } from "./env.js";

export interface CosmosContainers {
  users: Container;
  listings: Container;
}

export interface CosmosContext {
  client: CosmosClient;
  containers: CosmosContainers;
}

export function createCosmosContext(): CosmosContext | null {
  if (env.USE_IN_MEMORY_DB) {
    return null;
  }

  if (!env.COSMOS_ENDPOINT || !env.COSMOS_KEY) {
    throw new Error("COSMOS_ENDPOINT e COSMOS_KEY são obrigatórios quando USE_IN_MEMORY_DB=false.");
  }

  const client = new CosmosClient({
    endpoint: env.COSMOS_ENDPOINT,
    key: env.COSMOS_KEY
  });

  const database = client.database(env.COSMOS_DATABASE_ID);

  return {
    client,
    containers: {
      users: database.container(env.COSMOS_USERS_CONTAINER),
      listings: database.container(env.COSMOS_LISTINGS_CONTAINER)
    }
  };
}
