"use client";

import { useEffect, useRef } from "react";
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
import { SectionHeading } from "@/components/ui/section-heading";

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

export function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    section.dataset.reveal = "ready";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" className="section skills-section" ref={sectionRef}>
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
        <div className="technology-groups">
          {technologyGroups.map((group, groupIndex) => {
            const CategoryIcon = groupIcons[group.id];
            return (
              <article
                className="technology-group skills-reveal"
                key={group.id}
                style={{ "--reveal-order": groupIndex + 4 } as CSSProperties}
              >
                <header className="technology-group__header">
                  <span>
                    <CategoryIcon aria-hidden="true" />
                  </span>
                  <h3>{group.title}</h3>
                </header>
                <ul className="technology-list">
                  {group.technologies.map((technology) => {
                    const Icon = technologyIcons[technology.id];
                    return (
                      <li
                        className={`tech-tile${technology.featured ? "tech-tile--featured" : ""}${technology.wide ? "tech-tile--wide" : ""}`}
                        key={technology.id}
                        style={
                          {
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
                        {technology.featured && (
                          <span className="tech-tile__badge">Core</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
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
    </section>
  );
}
