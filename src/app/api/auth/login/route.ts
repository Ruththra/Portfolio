import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, createSession } from "@/features/auth/auth";
import {
  clearLoginAttempts,
  consumeLoginAttempt,
} from "@/features/auth/rate-limit";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    const input = schema.safeParse(await request.json());
    if (!input.success)
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    const forwarded =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const key = `${forwarded}:${input.data.email.toLowerCase()}`;
    const limit = await consumeLoginAttempt(key);
    if (!limit.allowed)
      return NextResponse.json(
        { message: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    const user = await authenticate(input.data.email, input.data.password);
    if (!user)
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    if (user.role !== "admin")
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    await createSession(user.id);
    await clearLoginAttempts(key);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Login is temporarily unavailable." },
      { status: 503 },
    );
  }
}
