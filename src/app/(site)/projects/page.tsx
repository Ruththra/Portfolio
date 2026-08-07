import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/features/projects/projects.data";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPortfolioContent } from "@/features/content/content.repository";
import { notFound } from "next/navigation";
export const metadata: Metadata = {
  title: "Projects",
  description:
    "Software, AI, and data project case studies by Ruththiragayan Sutharsan.",
};
export default async function ProjectsPage() {
  if (!(await getPortfolioContent()).showProjects) notFound();
  return (
    <div className="page-shell">
      <p className="eyebrow">WORK ARCHIVE</p>
      <h1>Projects</h1>
      <p className="page-lead">
        Real project case studies will live here, including the problem,
        decisions, implementation, and lessons learned.
      </p>
      {projects.length ? (
        <div className="project-grid">
          {projects
            .filter((p) => !p.placeholder)
            .map((project) => (
              <Link
                className="project-card"
                href={`/projects/${project.slug}`}
                key={project.slug}
              >
                <span>{project.category}</span>
                <h2>{project.title}</h2>
                <p>{project.shortDescription}</p>
              </Link>
            ))}
        </div>
      ) : (
        <EmptyState
          title="Case studies are being prepared"
          copy="Project content has intentionally not been invented. Add verified work in src/data/projects.ts."
        />
      )}
    </div>
  );
}
