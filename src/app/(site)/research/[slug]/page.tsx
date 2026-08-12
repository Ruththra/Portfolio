import type { Metadata } from "next";
import { ExternalLink, Github } from "lucide-react";
import { Paperclip } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TechnologyIcon } from "@/components/icons/TechnologyIcon";
import { getPortfolioContent } from "@/features/content/content.repository";
import { getResearchBySlug } from "@/features/research/research.repository";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (!(await getPortfolioContent()).showResearch) return {};
  const item = await getResearchBySlug((await params).slug);
  return item
    ? { title: item.title, description: item.abstract.slice(0, 160) }
    : {};
}
export default async function ResearchDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await getPortfolioContent()).showResearch) notFound();
  const item = await getResearchBySlug((await params).slug);
  if (!item || item.status === "archived") notFound();
  return (
    <article className="page-shell article">
      <p className="eyebrow">{item.status.replace("_", " ")}</p>
      <h1>{item.title}</h1>
      {item.subtitle && <p className="page-lead">{item.subtitle}</p>}
      {item.imageUrl && (
        <Image
          className="project-detail-image"
          src={item.imageUrl}
          alt={item.imageAlt}
          width={1200}
          height={750}
          priority
        />
      )}
      <p>
        <strong>Authors:</strong> {item.authors}
      </p>
      {item.venue && (
        <p>
          <strong>Venue:</strong> {item.venue}
        </p>
      )}
      <div className="project-detail-links">
        {item.publicationUrl && (
          <a href={item.publicationUrl} target="_blank" rel="noreferrer">
            <ExternalLink /> Read publication
          </a>
        )}
        {item.repositoryUrl && (
          <a href={item.repositoryUrl} target="_blank" rel="noreferrer">
            <Github /> Repository
          </a>
        )}
      </div>
      <section className="project-overview">
        <h2>Abstract</h2>
        <p>{item.abstract}</p>
      </section>
      {item.techStack.length > 0 && (
        <section className="project-tech-stack">
          <h2>Technologies</h2>
          <ul>
            {item.techStack.map((tech) => (
              <li key={tech.id}>
                <TechnologyIcon id={tech.id} />
                {tech.name}
              </li>
            ))}
          </ul>
        </section>
      )}
      {item.associatedFiles.some((file) => file.isPublic ?? true) && (
        <section className="project-files">
          <h2>Research files</h2>
          <ul>
            {item.associatedFiles
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
