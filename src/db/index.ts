import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
const configuredPoolMax = Number(process.env.DATABASE_POOL_MAX);
const poolMax =
  Number.isInteger(configuredPoolMax) &&
  configuredPoolMax >= 1 &&
  configuredPoolMax <= 10
    ? configuredPoolMax
    : process.env.NODE_ENV === "production"
      ? 2
      : 5;
const client = connectionString
  ? postgres(connectionString, { max: poolMax, prepare: false })
  : null;

export const db = client ? drizzle(client) : null;

export function requireDb() {
  if (!db) throw new Error("DATABASE_URL is not configured");
  return db;
}
