import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Github, Linkedin, Paperclip } from "lucide-react";
import { notFound } from "next/navigation";
import { TechnologyIcon } from "@/components/icons/TechnologyIcon";
import { getPortfolioContent } from "@/features/content/content.repository";
import { getPublicProjectBySlug } from "@/features/projects/project.repository";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (!(await getPortfolioContent()).showProjects) return {};
  const project = await getPublicProjectBySlug((await params).slug);
  return project
    ? { title: project.title, description: project.description.slice(0, 160) }
    : {};
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await getPortfolioContent()).showProjects) notFound();
  const project = await getPublicProjectBySlug((await params).slug);
  if (!project) notFound();
  return (
    <article className="page-shell article">
      <p className="eyebrow">{project.status.replace("_", " ")}</p>
      <h1>{project.title}</h1>
      <p className="page-lead">{project.description}</p>
      <Image
        className="project-detail-image"
        src={project.imageUrl}
        alt={project.imageAlt}
        width={1200}
        height={750}
        priority
      />
      <div className="project-detail-links">
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer">
            <Github aria-hidden="true" /> View on GitHub
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" /> Visit live site
          </a>
        )}
        {project.linkedinUrl && (
          <a href={project.linkedinUrl} target="_blank" rel="noreferrer">
            <Linkedin aria-hidden="true" /> View on LinkedIn
          </a>
        )}
      </div>
      {project.techStack.length > 0 && (
        <section
          className="project-tech-stack"
          aria-labelledby="tech-stack-title"
        >
          <h2 id="tech-stack-title">Tech stack</h2>
          <ul>
            {project.techStack.map((technology) => (
              <li key={technology.id}>
                <TechnologyIcon id={technology.id} />
                {technology.name}
              </li>
            ))}
          </ul>
        </section>
      )}
      {project.associatedFiles.some((file) => file.isPublic ?? true) && (
        <section
          className="project-files"
          aria-labelledby="project-files-title"
        >
          <h2 id="project-files-title">Associated files</h2>
          <ul>
            {project.associatedFiles
              .filter((file) => file.isPublic ?? true)
              .map((file) => (
                <li key={file.pathname}>
                  <a href={file.url} target="_blank" rel="noreferrer">
                    <Paperclip aria-hidden="true" /> {file.name}
                  </a>
                </li>
              ))}
          </ul>
        </section>
      )}
    </article>
  );
}
