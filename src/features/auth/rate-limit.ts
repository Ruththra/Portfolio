import "server-only";
import { eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { loginAttempts } from "@/db/schema";

const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 5;
export async function consumeLoginAttempt(key: string) {
  const database = requireDb();
  const current = (
    await database
      .select()
      .from(loginAttempts)
      .where(eq(loginAttempts.key, key))
      .limit(1)
  )[0];
  const now = new Date();
  if (
    !current ||
    now.getTime() - current.windowStartedAt.getTime() > WINDOW_MS
  ) {
    await database
      .insert(loginAttempts)
      .values({ key, count: "1", windowStartedAt: now })
      .onConflictDoUpdate({
        target: loginAttempts.key,
        set: { count: "1", windowStartedAt: now },
      });
    return { allowed: true, retryAfter: 0 };
  }
  const count = Number(current.count);
  if (count >= LIMIT)
    return {
      allowed: false,
      retryAfter: Math.ceil(
        (WINDOW_MS - (now.getTime() - current.windowStartedAt.getTime())) /
          1000,
      ),
    };
  await database
    .update(loginAttempts)
    .set({ count: String(count + 1) })
    .where(eq(loginAttempts.key, key));
  return { allowed: true, retryAfter: 0 };
}
export async function clearLoginAttempts(key: string) {
  await requireDb().delete(loginAttempts).where(eq(loginAttempts.key, key));
}
