/**
 * Loads demonstration content only when the database has no projects yet.
 * Safe to run on every deploy: it never touches an instance that has data.
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

// Accept whichever variable a host database integration provides.
const dbUrl = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"]
  .map((k) => process.env[k])
  .find(Boolean);
const db = new PrismaClient(dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined);

async function main() {
  const projects = await db.project.count();
  await db.$disconnect();
  if (projects > 0) {
    console.log(`Database already has ${projects} projects; skipping demo seed.`);
    return;
  }
  console.log("Empty database: loading demonstration content…");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
