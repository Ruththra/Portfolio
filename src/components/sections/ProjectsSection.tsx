import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listPublicProjects } from "@/features/projects/project.repository";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedProjectsCarousel } from "./FeaturedProjectsCarousel";

export async function FeaturedProjects() {
  const featuredProjects = await listPublicProjects();
  return (
    <section id="projects" className="section">
      <div className="heading-row">
        <SectionHeading
          eyebrow="SELECTED WORK"
          title="Featured Projects"
          intro="A growing collection of software, AI, and data work—documented with the decisions behind it."
        />
        <Link href="/projects">
          View all <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
      {featuredProjects.length ? (
        <FeaturedProjectsCarousel projects={featuredProjects} />
      ) : (
        <EmptyState
          title="Case studies are being prepared"
          copy="Verified project stories will appear here soon. Nothing fictional—just real work, carefully documented."
        />
      )}
    </section>
  );
}
