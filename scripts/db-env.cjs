/**
 * Resolves the database connection from whichever variables the host provides,
 * so a one-click Vercel Storage (Neon / Postgres) integration works with no
 * manual configuration. Used by the build and by the app at runtime.
 */
const RUNTIME_KEYS = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"];
const DIRECT_KEYS = ["DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING", "DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"];

function first(keys) {
  for (const k of keys) if (process.env[k]) return process.env[k];
  return undefined;
}

module.exports = {
  runtimeUrl: () => first(RUNTIME_KEYS),
  directUrl: () => first(DIRECT_KEYS),
};
