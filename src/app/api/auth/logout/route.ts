import { NextResponse } from "next/server";
import { destroySession, getSessionUser } from "@/features/auth/auth";
export async function POST(request: Request) {
  if (!(await getSessionUser()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  await destroySession();
  return NextResponse.json({ ok: true });
}
