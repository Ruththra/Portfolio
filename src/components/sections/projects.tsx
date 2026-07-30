import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featuredProjects } from "@/data/projects";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";

export function FeaturedProjects() {
  return (
    <section id="projects" className="section">
      <div className="heading-row">
        <SectionHeading
          eyebrow="SELECTED WORK"
          title="Featured Projects"
          intro="A growing collection of software, AI, and data work—documented with the decisions behind it."
        />
        <Link href="/projects">
          View all <ArrowUpRight />
        </Link>
      </div>
      {featuredProjects.length ? (
        <div className="project-grid">
          {featuredProjects.map((project) => (
            <Link
              href={`/projects/${project.slug}`}
              key={project.slug}
              className="project-card"
            >
              <span>{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.shortDescription}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Case studies are being prepared"
          copy="Verified project stories will appear here soon. Nothing fictional—just real work, carefully documented."
        />
      )}
    </section>
  );
}
