/**
 * Vercel build: connect to the database (any common variable name), apply
 * migrations, load demo content into an empty database, then build.
 */
const { execSync } = require("node:child_process");
const { directUrl } = require("./db-env.cjs");

const url = directUrl();
if (!url) {
  console.error(`
────────────────────────────────────────────────────────────
 IPPLY needs a database, and none is connected to this project.

 In Vercel: open your project → Storage → Create Database →
 choose Neon (Serverless Postgres) → Connect to this project.
 Then redeploy. No other settings are needed.
────────────────────────────────────────────────────────────
`);
  process.exit(1);
}

// Migrations need a direct (non-pooled) connection.
const env = { ...process.env, DATABASE_URL: url };
const run = (cmd) => execSync(cmd, { stdio: "inherit", env });
run("npx prisma generate");
run("npx prisma migrate deploy");
run("npx tsx prisma/seed-if-empty.ts");
run("npx next build");
