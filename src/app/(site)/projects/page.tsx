import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TechnologyIcon } from "@/components/icons/TechnologyIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPortfolioContent } from "@/features/content/content.repository";
import { listPublicProjects } from "@/features/projects/project.repository";
import { notFound } from "next/navigation";
export const metadata: Metadata = {
  title: "Projects",
  description:
    "Software, AI, and data project case studies by Ruththiragayan Sutharsan.",
};
export default async function ProjectsPage() {
  if (!(await getPortfolioContent()).showProjects) notFound();
  const projects = await listPublicProjects();
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
          {projects.map((project) => (
            <Link
              className="project-card"
              href={`/projects/${project.slug}`}
              key={project.slug}
            >
              <Image
                src={project.imageUrl}
                alt={project.imageAlt}
                width={640}
                height={400}
              />
              <span>{project.status.replace("_", " ")}</span>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              {project.techStack.length > 0 && (
                <ul className="project-card-tech" aria-label="Tech stack">
                  {project.techStack.map((technology) => (
                    <li key={technology.id} title={technology.name}>
                      <TechnologyIcon id={technology.id} />
                    </li>
                  ))}
                </ul>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Case studies are being prepared"
          copy="Uploaded project stories will appear here in their configured order."
        />
      )}
    </div>
  );
}
