// Entry point for `npx tsx scripts/seed.ts`.
// dotenv must run before the dynamic import below — static imports are hoisted in ESM,
// which would otherwise load src/lib/db.ts (and read process.env.MONGODB_URI) too early.
import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback to .env

async function main() {
  const { runSeed } = await import("../src/seed/seed");
  await runSeed();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[seed] Failed:", err);
    process.exit(1);
  });
