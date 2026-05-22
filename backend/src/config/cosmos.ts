import { CosmosClient, type Container } from "@azure/cosmos";
import { env } from "./env.js";

export interface CosmosContainers {
  users: Container;
  listings: Container;
  favourites: Container;
  conversations: Container;
  messages: Container;
  reports: Container;
}

export interface CosmosContext {
  client: CosmosClient;
  containers: CosmosContainers;
}

interface CosmosContainerCheckResult {
  id: string;
  partitionKeyPaths: string[];
}

interface CosmosBootstrapResult {
  databaseCreated: boolean;
  containersCreated: string[];
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
      listings: database.container(env.COSMOS_LISTINGS_CONTAINER),
      favourites: database.container(env.COSMOS_FAVOURITES_CONTAINER),
      conversations: database.container(env.COSMOS_CONVERSATIONS_CONTAINER),
      messages: database.container(env.COSMOS_MESSAGES_CONTAINER),
      reports: database.container(env.COSMOS_REPORTS_CONTAINER)
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

const CONTAINER_IDS: Array<{ key: keyof CosmosContainers; idEnv: string }> = [
  { key: "users", idEnv: env.COSMOS_USERS_CONTAINER },
  { key: "listings", idEnv: env.COSMOS_LISTINGS_CONTAINER },
  { key: "favourites", idEnv: env.COSMOS_FAVOURITES_CONTAINER },
  { key: "conversations", idEnv: env.COSMOS_CONVERSATIONS_CONTAINER },
  { key: "messages", idEnv: env.COSMOS_MESSAGES_CONTAINER },
  { key: "reports", idEnv: env.COSMOS_REPORTS_CONTAINER }
];

async function ensureCosmosResources(cosmos: CosmosContext): Promise<CosmosBootstrapResult> {
  const databaseCreateResult = await cosmos.client.databases.createIfNotExists({
    id: env.COSMOS_DATABASE_ID
  });
  const { database } = databaseCreateResult;

  const containersCreated: string[] = [];
  for (const { idEnv } of CONTAINER_IDS) {
    const result = await database.containers.createIfNotExists({
      id: idEnv,
      partitionKey: { paths: ["/id"] }
    });
    if (result.statusCode === 201) {
      containersCreated.push(idEnv);
    }
  }

  return {
    databaseCreated: databaseCreateResult.statusCode === 201,
    containersCreated
  };
}

export async function assertCosmosReady(cosmos: CosmosContext): Promise<CosmosBootstrapResult> {
  const bootstrap = await ensureCosmosResources(cosmos);

  const usersContainer = await readContainerMetadata(cosmos.containers.users);

  if (!usersContainer.partitionKeyPaths.includes("/id")) {
    throw new Error(
      `Cosmos users container "${usersContainer.id}" must use partition key "/id".`
    );
  }

  return bootstrap;
}
