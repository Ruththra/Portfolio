import "server-only";

import { Resend } from "resend";
import { getServerEnvironment } from "@/config/environment";
import type { ContactInput } from "@/features/contact/contact.schema";
import type { ContactResponse } from "@/features/contact/contact.types";

export type ContactServiceResult = {
  response: ContactResponse;
  status: number;
};

async function verifyTurnstile(token: string | undefined, secret: string) {
  if (!token) return false;
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    },
  );
  if (!response.ok) return false;
  const result: unknown = await response.json();
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    result.success === true
  );
}

export async function deliverContactMessage(
  data: ContactInput,
): Promise<ContactServiceResult> {
  const environment = getServerEnvironment();
  if (
    environment.TURNSTILE_SECRET_KEY &&
    !(await verifyTurnstile(
      data.turnstileToken,
      environment.TURNSTILE_SECRET_KEY,
    ))
  ) {
    return {
      status: 400,
      response: {
        success: false,
        message: data.turnstileToken
          ? "Verification failed. Please try again."
          : "Please complete the verification.",
      },
    };
  }

  if (
    environment.RESEND_API_KEY &&
    environment.CONTACT_TO_EMAIL &&
    environment.CONTACT_FROM_EMAIL
  ) {
    const resend = new Resend(environment.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: environment.CONTACT_FROM_EMAIL,
      to: environment.CONTACT_TO_EMAIL,
      replyTo: data.email,
      subject: `[Portfolio] ${data.subject}`,
      text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
    });
    if (error)
      return {
        status: 502,
        response: {
          success: false,
          message: "Email delivery failed. Please try again later.",
        },
      };
    return {
      status: 200,
      response: {
        success: true,
        message: "Thanks—your message has been sent.",
      },
    };
  }

  if (environment.NODE_ENV === "production") {
    return {
      status: 503,
      response: {
        success: false,
        message: "Contact delivery is not configured yet.",
      },
    };
  }
  console.info("[contact:development]", {
    name: data.name,
    subject: data.subject,
    messageLength: data.message.length,
  });
  return {
    status: 200,
    response: {
      success: true,
      message:
        "Development mode: validated successfully; email delivery is not configured.",
      development: true,
    },
  };
}
