import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() {
  return (
    <article className="page-shell article">
      <p className="eyebrow">PRIVACY</p>
      <h1>Privacy</h1>
      <p>
        This portfolio does not use advertising trackers. Contact form details
        are used only to respond to your message and, when configured, are
        delivered through Resend. Cloudflare Turnstile may process technical
        data for spam prevention when enabled.
      </p>
      <p>
        Do not submit sensitive personal information through the contact form.
      </p>
    </article>
  );
}
