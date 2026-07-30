import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact";

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      {
        message: "Please correct the form fields.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  const data = parsed.data;
  if (Date.now() - data.startedAt < 2500)
    return NextResponse.json(
      { message: "Please wait a moment before submitting." },
      { status: 429 },
    );

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!data.turnstileToken)
      return NextResponse.json(
        { message: "Please complete the verification." },
        { status: 400 },
      );
    const verification = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: data.turnstileToken,
        }),
      },
    );
    const result = (await verification.json()) as { success?: boolean };
    if (!result.success)
      return NextResponse.json(
        { message: "Verification failed. Please try again." },
        { status: 400 },
      );
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (key && to && from) {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `[Portfolio] ${data.subject}`,
      text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
    });
    if (error)
      return NextResponse.json(
        { message: "Email delivery failed. Please try again later." },
        { status: 502 },
      );
    return NextResponse.json({ message: "Thanks—your message has been sent." });
  }
  if (process.env.NODE_ENV === "production")
    return NextResponse.json(
      { message: "Contact delivery is not configured yet." },
      { status: 503 },
    );
  console.info("[contact:development]", {
    name: data.name,
    subject: data.subject,
    messageLength: data.message.length,
  });
  return NextResponse.json({
    message:
      "Development mode: validated successfully; email delivery is not configured.",
    development: true,
  });
}
