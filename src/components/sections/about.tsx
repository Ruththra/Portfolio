import { Braces, Database, GraduationCap, Layers3 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const highlights = [
  ["CSE Undergraduate", GraduationCap],
  ["Data Science & Engineering", Database],
  ["Full-Stack Development", Braces],
  ["AI & Data Systems", Layers3],
] as const;
export function About() {
  return (
    <section id="about" className="section about">
      <div>
        <SectionHeading eyebrow="BEHIND THE WORK" title="About Me" />
        <div className="about-copy">
          <p>
            I am a Computer Science and Engineering undergraduate at the
            University of Moratuwa, specializing in Data Science and
            Engineering. I am also a Full-Stack Developer who enjoys building
            scalable web and mobile applications using modern technologies.
          </p>
          <p>
            I am fascinated by how software, data, machine learning, deep
            learning, computer vision, and intelligent systems can be used to
            identify patterns, automate decisions, and solve real-world
            problems. My work spans full-stack platforms, backend services,
            AI-powered applications, data-driven systems, retrieval-augmented
            generation solutions, and cloud deployment.
          </p>
          <p>
            Beyond development, I strengthen my problem-solving and engineering
            skills through competitive programming, hackathons, academic
            projects, and collaborative teamwork. I am passionate about
            transforming complex ideas into practical solutions through clean,
            efficient, and maintainable code while continuously exploring new
            areas of computer science and technology.
          </p>
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
