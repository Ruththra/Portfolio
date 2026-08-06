import { NextResponse } from "next/server";
import { authorizeApi, sameOrigin } from "@/features/auth/api";
import {
  getPortfolioContent,
  savePortfolioContent,
} from "@/features/content/content.repository";
import { portfolioContentSchema } from "@/features/content/content.schema";
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
  return NextResponse.json(await savePortfolioContent(input.data));
}
