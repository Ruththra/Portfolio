import { NextResponse } from "next/server";
import { getSessionUser } from "./auth";
export async function authorizeApi() {
  const user = await getSessionUser();
  if (!user)
    return {
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  if (user.role !== "admin")
    return {
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  return { user };
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
