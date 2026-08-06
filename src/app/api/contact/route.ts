import { NextResponse } from "next/server";
import { contactSchema } from "@/features/contact/contact.schema";
import { deliverContactMessage } from "@/features/contact/contact.service";
import type { ContactResponse } from "@/features/contact/contact.types";

function json(response: ContactResponse, status = 200) {
  return NextResponse.json(response, { status });
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ success: false, message: "Invalid request body." }, 400);
  }
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success)
    return json(
      {
        success: false,
        message: "Please correct the form fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  const data = parsed.data;
  if (Date.now() - data.startedAt < 2500)
    return json(
      { success: false, message: "Please wait a moment before submitting." },
      429,
    );

  try {
    const result = await deliverContactMessage(data);
    return json(result.response, result.status);
  } catch (error) {
    console.error(
      "[contact:configuration]",
      error instanceof Error ? error.message : "Unknown configuration error",
    );
    return json(
      {
        success: false,
        message: "Contact delivery is temporarily unavailable.",
      },
      503,
    );
  }
}
