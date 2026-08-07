import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPortfolioContent } from "@/features/content/content.repository";

export async function About() {
  const content = await getPortfolioContent();
  return (
    <section id="about" className="section about">
      <div>
        <SectionHeading eyebrow="BEHIND THE WORK" title="About Me" />
        <div className="about-copy">
          {content.aboutText.split(/\n\s*\n/).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
