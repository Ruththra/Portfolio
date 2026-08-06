import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
const client = connectionString
  ? postgres(connectionString, { max: 1, prepare: false })
  : null;

export const db = client ? drizzle(client) : null;

export function requireDb() {
  if (!db) throw new Error("DATABASE_URL is not configured");
  return db;
}
