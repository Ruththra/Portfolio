import { BrainCircuit, ChartNoAxesCombined, Code2 } from "lucide-react";
import { capabilityPaths, skillCategories } from "@/data/skills";
import { SectionHeading } from "@/components/ui/section-heading";

const icons = [Code2, BrainCircuit, ChartNoAxesCombined];
export function Skills() {
  return (
    <section id="skills" className="section">
      <SectionHeading
        eyebrow="THE TOOLKIT"
        title="Skills & Technologies"
        intro="As a Computer Science and Engineering student, I enjoy exploring different areas of technology—from building full-stack applications and designing intuitive interfaces to developing intelligent systems and discovering insights from data."
      />
      <div className="capabilities">
        {capabilityPaths.map((path, i) => {
          const Icon = icons[i];
          return (
            <article key={path}>
              <Icon aria-hidden="true" />
              <h3>{path}</h3>
              <span>0{i + 1}</span>
            </article>
          );
        })}
      </div>
      <div className="skills-grid">
        {skillCategories.map((category) => (
          <article className="skill-card" key={category.title}>
            <h3>{category.title}</h3>
            <ul>
              {category.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
