import { ContactInteractive } from "@/components/sections/ContactInteractive";
import { getPortfolioContent } from "@/features/content/content.repository";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function Contact() {
  const content = await getPortfolioContent();
  const socials = [
    ["Email", content.email ? `mailto:${content.email}` : ""],
    ["LinkedIn", content.linkedin],
    ["GitHub", content.github],
    ["Instagram", content.instagram],
  ] as const;

  return (
    <section id="contact" className="section contact">
      <SectionHeading
        eyebrow="LET’S CONNECT"
        title="Let’s Build Something Meaningful"
        intro="I’m open to internships, collaborations, research opportunities, and exciting software, AI, or data-driven projects. Whether you have an opportunity, an idea, or simply want to start a conversation, feel free to reach out."
      />
      <div className="contact-grid">
        <ContactInteractive
          socials={socials.map(([label, url]) => ({ label, url }))}
        />
      </div>
    </section>
  );
}
