import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT;
const COSMOS_KEY = process.env.COSMOS_KEY;
const COSMOS_DATABASE_ID = process.env.COSMOS_DATABASE_ID ?? "uninest";
const COSMOS_USERS_CONTAINER = process.env.COSMOS_USERS_CONTAINER ?? "users";
const COSMOS_LISTINGS_CONTAINER = process.env.COSMOS_LISTINGS_CONTAINER ?? "listings";

async function statsHandler(
  _request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    if (!COSMOS_ENDPOINT || !COSMOS_KEY) {
      throw new Error("COSMOS_ENDPOINT and COSMOS_KEY must be configured.");
    }

    const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });
    const database = client.database(COSMOS_DATABASE_ID);
    const usersContainer = database.container(COSMOS_USERS_CONTAINER);
    const listingsContainer = database.container(COSMOS_LISTINGS_CONTAINER);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const querySpec = {
      query: "SELECT VALUE COUNT(1) FROM c WHERE c.createdAt >= @since",
      parameters: [{ name: "@since", value: since }]
    };

    const [usersResult, listingsResult] = await Promise.all([
      usersContainer.items.query<number>(querySpec).fetchAll(),
      listingsContainer.items.query<number>(querySpec).fetchAll()
    ]);

    const body = {
      period: "last_24h",
      since,
      newUsers: usersResult.resources[0] ?? 0,
      newListings: listingsResult.resources[0] ?? 0,
      generatedAt: new Date().toISOString()
    };

    context.log("stats response", JSON.stringify(body));

    return {
      status: 200,
      jsonBody: body
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    context.log(`stats error: ${message}`);
    return {
      status: 500,
      jsonBody: { error: message }
    };
  }
}

app.http("stats", {
  methods: ["GET"],
  authLevel: "function",
  route: "stats",
  handler: statsHandler
});
