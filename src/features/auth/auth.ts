import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { compare } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireDb } from "@/db";
import { sessions, users } from "@/db/schema";
import { SESSION_COOKIE } from "./auth.utils";

const SESSION_LENGTH = 60 * 60 * 24 * 7;
const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function authenticate(email: string, password: string) {
  const user = (
    await requireDb()
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1)
  )[0];
  if (!user || !(await compare(password, user.passwordHash))) return null;
  return user;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await requireDb()
    .insert(sessions)
    .values({
      userId,
      tokenHash: tokenHash(token),
      expiresAt: new Date(Date.now() + SESSION_LENGTH * 1000),
    });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_LENGTH,
  });
}

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = (
    await requireDb()
      .select({ id: users.id, email: users.email, role: users.role })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, tokenHash(token)),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1)
  )[0];
  return row ?? null;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
  return user;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token)
    await requireDb()
      .delete(sessions)
      .where(eq(sessions.tokenHash, tokenHash(token)));
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
