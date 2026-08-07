import { NextResponse } from "next/server";
import { authorizeApi } from "@/features/auth/api";
import { getPost } from "@/features/blog/blog.repository";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const post = await getPost((await params).id);
  return post
    ? NextResponse.json(post)
    : NextResponse.json({ message: "Not found" }, { status: 404 });
}
