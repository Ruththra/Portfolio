import { Braces, Database, GraduationCap, Layers3 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPortfolioContent } from "@/features/content/content.repository";

const highlights = [
  ["CSE Undergraduate", GraduationCap],
  ["Data Science & Engineering", Database],
  ["Full-Stack Development", Braces],
  ["AI & Data Systems", Layers3],
] as const;
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
      <div className="highlight-grid">
        {highlights.map(([label, Icon]) => (
          <article key={label}>
            <Icon aria-hidden="true" />
            <h3>{label}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
