import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { TechnologyIcon } from "@/components/icons/TechnologyIcon";
import { listPublicProjects } from "@/features/projects/project.repository";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function FeaturedProjects() {
  const featuredProjects = (await listPublicProjects()).slice(0, 4);
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
              <Image
                src={project.imageUrl}
                alt={project.imageAlt}
                width={640}
                height={400}
              />
              <span>{project.status.replace("_", " ")}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {project.techStack.length > 0 && (
                <ul className="project-card-tech" aria-label="Tech stack">
                  {project.techStack.slice(0, 5).map((technology) => (
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
          copy="Verified project stories will appear here soon. Nothing fictional—just real work, carefully documented."
        />
      )}
    </section>
  );
}
