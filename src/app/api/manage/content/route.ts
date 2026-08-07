import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authorizeApi, sameOrigin } from "@/features/auth/api";
import {
  getPortfolioContent,
  savePortfolioContent,
  savePortfolioVisibility,
} from "@/features/content/content.repository";
import {
  portfolioContentSchema,
  portfolioVisibilitySchema,
} from "@/features/content/content.schema";
export async function GET() {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  return NextResponse.json(await getPortfolioContent());
}
export async function PUT(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const input = portfolioContentSchema.safeParse(await request.json());
  if (!input.success)
    return NextResponse.json(
      {
        message: "Please correct the form.",
        issues: input.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  const content = await savePortfolioContent(input.data);
  revalidatePath("/", "layout");
  return NextResponse.json(content);
}
export async function PATCH(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const input = portfolioVisibilitySchema.safeParse(await request.json());
  if (!input.success)
    return NextResponse.json(
      { message: "Invalid visibility settings." },
      { status: 400 },
    );
  const content = await savePortfolioVisibility(input.data);
  revalidatePath("/", "layout");
  return NextResponse.json(content);
}
