import { NextResponse } from "next/server";
import { authorizeApi, sameOrigin } from "@/features/auth/api";
import { blogInputSchema } from "@/features/blog/blog.schema";
import {
  deletePost,
  getPost,
  slugExists,
  updatePost,
} from "@/features/blog/blog.repository";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Context) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const post = await getPost((await params).id);
  return post
    ? NextResponse.json(post)
    : NextResponse.json({ message: "Not found" }, { status: 404 });
}
export async function PUT(request: Request, { params }: Context) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const id = (await params).id;
  const input = blogInputSchema.safeParse(await request.json());
  if (!input.success)
    return NextResponse.json(
      {
        message: "Please correct the highlighted fields.",
        issues: input.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  if (await slugExists(input.data.slug, id))
    return NextResponse.json(
      {
        message: "That slug is already in use.",
        issues: { slug: ["Choose a unique slug."] },
      },
      { status: 409 },
    );
  const post = await updatePost(id, input.data);
  return post
    ? NextResponse.json(post)
    : NextResponse.json({ message: "Not found" }, { status: 404 });
}
export async function DELETE(request: Request, { params }: Context) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  await deletePost((await params).id);
  return new NextResponse(null, { status: 204 });
}
