import { Github, Linkedin, Mail, MapPin, Radio } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Contact() {
  const cards = [
    {
      label: "Email",
      value: siteConfig.email || "Add email in site configuration",
      icon: Mail,
      href: siteConfig.email ? `mailto:${siteConfig.email}` : "",
    },
    {
      label: "LinkedIn",
      value: siteConfig.socials.linkedin || "Profile not configured",
      icon: Linkedin,
      href: siteConfig.socials.linkedin,
    },
    {
      label: "GitHub",
      value: siteConfig.socials.github || "Profile not configured",
      icon: Github,
      href: siteConfig.socials.github,
    },
    { label: "Location", value: siteConfig.location, icon: MapPin, href: "" },
    {
      label: "Availability",
      value: siteConfig.availability,
      icon: Radio,
      href: "",
    },
  ];
  return (
    <section id="contact" className="section contact">
      <SectionHeading
        eyebrow="LET’S CONNECT"
        title="Let’s Build Something Meaningful"
        intro="I’m open to internships, collaborations, research opportunities, and exciting software, AI, or data-driven projects. Whether you have an opportunity, an idea, or simply want to start a conversation, feel free to reach out."
      />
      <div className="contact-grid">
        <div className="contact-cards">
          {cards.map(({ label, value, icon: Icon, href }) => {
            const content = (
              <>
                <Icon aria-hidden="true" />
                <span>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </span>
              </>
            );
            return href ? (
              <a key={label} href={href}>
                {content}
              </a>
            ) : (
              <div key={label} className="disabled-card">
                {content}
              </div>
            );
          })}
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
