import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

// Reuse one client per warm serverless instance (and across HMR reloads in dev).
const globalForDb = globalThis as unknown as { __agentpathDb?: Db };

function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const client = postgres(url, {
    ssl: isLocal ? false : "require",
    // Serverless functions run many instances in parallel; keep each one to a
    // single connection so we don't exhaust the database's connection limit.
    // Use a pooled connection string (e.g. Neon's "-pooler" host) on Vercel.
    max: process.env.VERCEL ? 1 : 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Required for transaction-mode poolers (PgBouncer / Neon pooler / Supavisor).
    prepare: false,
  });
  return drizzle(client, { schema });
}

function getDb(): Db {
  return (globalForDb.__agentpathDb ??= createDb());
}

// Lazily connect on first use so importing this module (e.g. during
// `next build` page-data collection) never requires DATABASE_URL.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
