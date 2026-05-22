/**
 * Wipes ALL data from every Cosmos container, then exits.
 * Restart the backend afterwards so the default seed runs again.
 *
 * Usage: npm --prefix backend run reset
 *
 * Requires USE_IN_MEMORY_DB=false and valid Cosmos credentials in backend/.env.
 */
import type { Container } from "@azure/cosmos";
import { assertCosmosReady, createCosmosContext, type CosmosContainers } from "../config/cosmos.js";
import { env } from "../config/env.js";

interface DocWithId {
  id: string;
}

async function wipeContainer(container: Container, label: string): Promise<number> {
  const { resources } = await container.items.query<DocWithId>("SELECT c.id FROM c").fetchAll();
  if (resources.length === 0) {
    console.log(`  ${label}: already empty`);
    return 0;
  }

  let deleted = 0;
  // Batch deletes with limited concurrency to avoid 429
  const concurrency = 10;
  for (let i = 0; i < resources.length; i += concurrency) {
    const batch = resources.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (doc) => {
        try {
          await container.item(doc.id, doc.id).delete();
          deleted++;
        } catch (err) {
          const code = (err as { code?: number }).code;
          if (code !== 404) {
            console.warn(`  ${label}: failed to delete ${doc.id}`, code ?? err);
          }
        }
      })
    );
  }
  console.log(`  ${label}: deleted ${deleted}/${resources.length}`);
  return deleted;
}

async function main(): Promise<void> {
  if (env.USE_IN_MEMORY_DB) {
    console.error("USE_IN_MEMORY_DB=true — nothing to reset in in-memory mode.");
    console.error("If you want to start fresh in-memory, just restart the backend.");
    process.exit(1);
  }

  const cosmos = createCosmosContext();
  if (!cosmos) {
    console.error("Cosmos context could not be created (missing credentials?).");
    process.exit(1);
  }

  console.log("Ensuring Cosmos containers exist...");
  await assertCosmosReady(cosmos);

  const targets: Array<{ key: keyof CosmosContainers; label: string }> = [
    { key: "users", label: "users" },
    { key: "listings", label: "listings" },
    { key: "favourites", label: "favourites" },
    { key: "conversations", label: "conversations" },
    { key: "messages", label: "messages" },
    { key: "reports", label: "reports" }
  ];

  console.log("Wiping Cosmos data:");
  let total = 0;
  for (const { key, label } of targets) {
    total += await wipeContainer(cosmos.containers[key], label);
  }

  console.log(`\nDone. ${total} document(s) deleted in total.`);
  console.log("Restart the backend (npm --prefix backend run dev) to re-seed users and listings.");
}

main().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
