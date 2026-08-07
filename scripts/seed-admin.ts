import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/db/schema";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!databaseUrl || !email || !password) {
    throw new Error(
      "DATABASE_URL, ADMIN_SEED_EMAIL, and ADMIN_SEED_PASSWORD are required.",
    );
  }
  if (password.length < 14) {
    throw new Error("ADMIN_SEED_PASSWORD must contain at least 14 characters.");
  }

  const client = postgres(databaseUrl, { max: 1 });
  const database = drizzle(client);
  const passwordHash = await hash(password, 12);
  const existing = (
    await database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
  )[0];

  if (existing) {
    await database
      .update(users)
      .set({ passwordHash, role: "admin" })
      .where(eq(users.id, existing.id));
  } else {
    await database.insert(users).values({ email, passwordHash, role: "admin" });
  }

  await client.end();
  console.info(
    existing ? "Administrator credentials updated." : "Administrator created.",
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Seed failed.");
  process.exitCode = 1;
});
