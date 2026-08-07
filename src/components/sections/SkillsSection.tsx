import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import {
  SiC,
  SiCss,
  SiCplusplus,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiFigma,
  SiFirebase,
  SiGit,
  SiGithub,
  SiGooglegemini,
  SiGreensock,
  SiHtml5,
  SiHuggingface,
  SiJavascript,
  SiJupyter,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiNumpy,
  SiOpenjdk,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiReact,
  SiScikitlearn,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import {
  Blocks,
  BrainCircuit,
  Braces,
  ChartNoAxesCombined,
  Code2,
  Database,
  Eye,
  FileCode2,
  Image,
  Network,
  Palette,
  PanelsTopLeft,
  ServerCog,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  capabilityPaths,
  practices,
  technologyGroups,
  type TechnologyId,
} from "@/data/skills";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollRevealSection } from "@/components/animations/ScrollRevealSection";

type TechnologyIcon = IconType | LucideIcon;
const technologyIcons: Record<TechnologyId, TechnologyIcon> = {
  python: SiPython,
  typescript: SiTypescript,
  javascript: SiJavascript,
  java: SiOpenjdk,
  cplusplus: SiCplusplus,
  c: SiC,
  ballerina: Code2,
  react: SiReact,
  nextjs: SiNextdotjs,
  html5: SiHtml5,
  css3: SiCss,
  tailwind: SiTailwindcss,
  gsap: SiGreensock,
  nodejs: SiNodedotjs,
  express: SiExpress,
  fastapi: SiFastapi,
  rest: Network,
  postgresql: SiPostgresql,
  mysql: SiMysql,
  mongodb: SiMongodb,
  firebase: SiFirebase,
  supabase: SiSupabase,
  pandas: SiPandas,
  numpy: SiNumpy,
  jupyter: SiJupyter,
  scikitlearn: SiScikitlearn,
  huggingface: SiHuggingface,
  openai: Sparkles,
  gemini: SiGooglegemini,
  "machine-learning": BrainCircuit,
  "deep-learning": Network,
  "computer-vision": Eye,
  rag: Blocks,
  git: SiGit,
  github: SiGithub,
  docker: SiDocker,
  linux: SiLinux,
  vscode: FileCode2,
  vercel: SiVercel,
  figma: SiFigma,
  photoshop: Image,
  illustrator: Palette,
  canva: Palette,
};

const capabilityIcons = [Code2, BrainCircuit, ChartNoAxesCombined] as const;
const groupIcons: Record<(typeof technologyGroups)[number]["id"], LucideIcon> =
  {
    languages: Braces,
    frontend: PanelsTopLeft,
    backend: ServerCog,
    data: Database,
    ai: BrainCircuit,
    tools: Wrench,
  };

function getPyramidPosition(index: number, count: number) {
  const rowCount = Math.ceil((Math.sqrt(8 * count + 1) - 1) / 2);
  const rowSizes = Array.from({ length: rowCount }, (_, row) => row + 1);
  let excess = (rowCount * (rowCount + 1)) / 2 - count;

  for (let row = 1; row < rowSizes.length && excess > 0; row += 1) {
    if (rowSizes[row] > 1) {
      rowSizes[row] -= 1;
      excess -= 1;
    }
  }

  let offset = 0;
  for (let row = 0; row < rowSizes.length; row += 1) {
    const size = rowSizes[row];
    if (index < offset + size) {
      const column = index - offset;
      const widestRow = Math.max(...rowSizes);
      return {
        x: (column - (size - 1) / 2) * (1.7 / Math.max(widestRow - 1, 1)),
        y: rowCount === 1 ? 0 : -0.82 + (row / (rowCount - 1)) * 1.64,
      };
    }
    offset += size;
  }

  return { x: 0, y: 0 };
}

export function Skills() {
  return (
    <ScrollRevealSection id="skills" className="section skills-section">
      <SectionHeading
        eyebrow="THE TOOLKIT"
        title="Skills & Technologies"
        intro="I build across software engineering, intelligent systems, and data—using a modern toolkit for creating reliable, thoughtful, and scalable digital experiences."
      />
      <div className="capability-grid">
        {capabilityPaths.map((path, index) => {
          const Icon = capabilityIcons[index];
          return (
            <article
              className="capability-card skills-reveal"
              key={path.title}
              style={{ "--reveal-order": index } as CSSProperties}
            >
              <header>
                <span className="capability-card__icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className="capability-card__number">0{index + 1}</span>
              </header>
              <h3>{path.title}</h3>
              <p>{path.description}</p>
            </article>
          );
        })}
      </div>
      <div
        className="technology-panel skills-reveal"
        style={{ "--reveal-order": 3 } as CSSProperties}
      >
        <header className="technology-panel__heading">
          <div>
            <p className="eyebrow">CURATED STACK</p>
            <h3>Technology toolkit</h3>
          </div>
          <p>
            Languages, frameworks, platforms, and tools I use across projects.
          </p>
        </header>
        <div className="technology-groups technology-pyramids">
          {technologyGroups.map((group) => {
            const CategoryIcon = groupIcons[group.id];
            return (
              <article className="technology-group" key={group.id}>
                <header className="technology-group__header">
                  <span>
                    <CategoryIcon aria-hidden="true" />
                  </span>
                  <h3>{group.title}</h3>
                </header>
                <div className="tech-pyramid-stage">
                  <div className="tech-pyramid-glow" aria-hidden="true" />
                  <ul
                    className="tech-pyramid"
                    aria-label={`${group.title} technologies`}
                  >
                    {group.technologies.map((technology, index) => {
                      const Icon = technologyIcons[technology.id];
                      const position = getPyramidPosition(
                        index,
                        group.technologies.length,
                      );
                      return (
                        <li
                          className={
                            technology.featured
                              ? "tech-tile tech-tile--featured"
                              : "tech-tile"
                          }
                          key={technology.id}
                          tabIndex={0}
                          aria-label={technology.name}
                          style={
                            {
                              "--pyramid-x": position.x,
                              "--pyramid-y": position.y,
                              "--tech-color": technology.color ?? "var(--cyan)",
                            } as CSSProperties
                          }
                        >
                          <span className="tech-tile__icon">
                            <Icon aria-hidden="true" />
                          </span>
                          <span className="tech-tile__name">
                            {technology.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
        <div className="practices">
          <h3>Practices &amp; capabilities</h3>
          <ul>
            {practices.map((practice) => (
              <li key={practice}>{practice}</li>
            ))}
          </ul>
        </div>
      </div>
    </ScrollRevealSection>
  );
}
