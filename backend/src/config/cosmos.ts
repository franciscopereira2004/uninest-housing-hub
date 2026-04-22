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

interface CosmosContainerCheckResult {
  id: string;
  partitionKeyPaths: string[];
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

async function readContainerMetadata(container: Container): Promise<CosmosContainerCheckResult> {
  const { resource } = await container.read();

  if (!resource) {
    throw new Error("Cosmos container metadata could not be read.");
  }

  return {
    id: resource.id,
    partitionKeyPaths: resource.partitionKey?.paths ?? []
  };
}

export async function assertCosmosReady(cosmos: CosmosContext): Promise<void> {
  const database = cosmos.client.database(env.COSMOS_DATABASE_ID);
  await database.read();

  const usersContainer = await readContainerMetadata(cosmos.containers.users);

  if (!usersContainer.partitionKeyPaths.includes("/id")) {
    throw new Error(
      `Cosmos users container "${usersContainer.id}" must use partition key "/id".`
    );
  }
}
