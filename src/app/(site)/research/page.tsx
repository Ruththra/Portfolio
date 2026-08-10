import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import { TechnologyIcon } from "@/components/icons/TechnologyIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPortfolioContent } from "@/features/content/content.repository";
import { listPublicResearch } from "@/features/research/research.repository";
import { getPublicResearchPaper } from "@/features/research/research-files";
import { notFound } from "next/navigation";
export const metadata: Metadata = {
  title: "Research",
  description:
    "Research publications and ongoing studies by Ruththiragayan Sutharsan.",
};
export default async function ResearchPage() {
  if (!(await getPortfolioContent()).showResearch) notFound();
  const items = await listPublicResearch();
  return (
    <div className="page-shell">
      <p className="eyebrow">RESEARCH ARCHIVE</p>
      <h1>Research</h1>
      <p className="page-lead">
        Published papers, experiments, and ongoing research.
      </p>
      {items.length ? (
        <div className="project-grid">
          {items.map((item) => {
            const paper = getPublicResearchPaper(item.associatedFiles);
            return (
              <article className="research-listing" key={item.id}>
                <Link
                  className="project-card research-card"
                  href={`/research/${item.slug}`}
                >
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      width={640}
                      height={400}
                    />
                  )}
                  <span>{item.status.replace("_", " ")}</span>
                  <h2>{item.title}</h2>
                  {item.subtitle && (
                    <p className="project-card-subtitle">{item.subtitle}</p>
                  )}
                  <p>{item.abstract}</p>
                  <ul className="project-card-tech">
                    {item.techStack.map((tech) => (
                      <li key={tech.id} title={tech.name}>
                        <TechnologyIcon id={tech.id} />
                      </li>
                    ))}
                  </ul>
                </Link>
                {paper && (
                  <a
                    className="research-download"
                    href={paper.url}
                    download={paper.name}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download aria-hidden="true" /> Download paper
                  </a>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Research is being prepared"
          copy="Research entries will appear here once they are added."
        />
      )}
    </div>
  );
}
