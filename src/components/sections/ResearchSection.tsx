import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Pagination } from "@/components/ui/Pagination";
import { ResearchCarousel } from "./ResearchCarousel";
import { listPublicResearch } from "@/features/research/research.repository";
import { getPublicResearchPaper } from "@/features/research/research-files";
import { paginate } from "@/lib/pagination";

export async function ResearchPreview({ page }: { page?: string | string[] }) {
  const allResearch = await listPublicResearch();
  const {
    items: research,
    page: currentPage,
    totalPages,
  } = paginate(allResearch, page);
  const carouselItems = research.map((item) => {
    const paper = getPublicResearchPaper(item.associatedFiles);
    return { ...item, paper: paper ? { url: paper.url, name: paper.name } : undefined };
  });

  return (
    <section id="research" className="section">
      <div className="heading-row">
        <SectionHeading
          eyebrow="RESEARCH & DISCOVERY"
          title="Research"
          intro="Published papers, experiments, and ongoing studies across software, AI, and data."
        />
        <Link href="/research">
          View all <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
      {research.length ? (
        <>
          {research.length > 3 ? <ResearchCarousel items={carouselItems} /> : <div className="project-grid">
            {research.map((item) => {
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
                    <h3>{item.title}</h3>
                    {item.subtitle && (
                      <p className="project-card-subtitle">{item.subtitle}</p>
                    )}
                    <p>{item.abstract}</p>
                    {item.techStack.length > 0 && (
                      <ul className="project-card-tech" aria-label="Tech stack">
                        {item.techStack.map((technology) => (
                          <li key={technology.id} title={technology.name}>
                            {technology.name}
                          </li>
                        ))}
                      </ul>
                    )}
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
          </div>}
          {research.length <= 3 && <Pagination
            basePath="/"
            currentPage={currentPage}
            totalPages={totalPages}
            pageParam="researchPage"
            hash="research"
          />}
        </>
      ) : (
        <EmptyState
          title="Research is being prepared"
          copy="Research entries will appear here once they are added."
        />
      )}
    </section>
  );
}
