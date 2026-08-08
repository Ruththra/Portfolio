import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { getPortfolioContent } from "@/features/content/content.repository";
import { hasUrl } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function Contact() {
  const content = await getPortfolioContent();
  const socials = [
    ["Email", content.email ? `mailto:${content.email}` : "", Mail],
    ["LinkedIn", content.linkedin, Linkedin],
    ["GitHub", content.github, Github],
    ["Instagram", content.instagram, Instagram],
  ] as const;

  return (
    <section id="contact" className="section contact">
      <SectionHeading
        eyebrow="LET’S CONNECT"
        title="Let’s Build Something Meaningful"
        intro="I’m open to internships, collaborations, research opportunities, and exciting software, AI, or data-driven projects. Whether you have an opportunity, an idea, or simply want to start a conversation, feel free to reach out."
      />
      <div className="contact-grid">
        <div className="socials contact-socials" aria-label="Social links">
          {socials.map(([label, url, Icon]) =>
            hasUrl(url) ? (
              <a
                key={label}
                href={url}
                aria-label={label}
                target={label === "Email" ? undefined : "_blank"}
                rel={label === "Email" ? undefined : "noreferrer"}
              >
                <Icon aria-hidden="true" />
              </a>
            ) : (
              <span
                key={label}
                aria-label={`${label} not configured`}
                title={`${label} not configured`}
              >
                <Icon aria-hidden="true" />
              </span>
            ),
          )}
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
