import { NextResponse } from "next/server";
import { authorizeApi, sameOrigin } from "@/features/auth/api";
import { blogInputSchema } from "@/features/blog/blog.schema";
import {
  createPost,
  listAllPosts,
  slugExists,
} from "@/features/blog/blog.repository";
export async function GET() {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  return NextResponse.json(await listAllPosts());
}
export async function POST(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const input = blogInputSchema.safeParse(await request.json());
  if (!input.success)
    return NextResponse.json(
      {
        message: "Please correct the highlighted fields.",
        issues: input.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  if (await slugExists(input.data.slug))
    return NextResponse.json(
      {
        message: "That slug is already in use.",
        issues: { slug: ["Choose a unique slug."] },
      },
      { status: 409 },
    );
  return NextResponse.json(await createPost(input.data), { status: 201 });
}
