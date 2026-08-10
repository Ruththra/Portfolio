"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TechnologyIcon } from "@/components/icons/TechnologyIcon";

type FeaturedProject = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  status: string;
  techStack: Array<{ id: string; name: string }>;
};

const PROJECTS_PER_SLIDE = 3;

export function FeaturedProjectsCarousel({
  projects,
}: {
  projects: FeaturedProject[];
}) {
  const [slide, setSlide] = useState(0);
  const slideCount = Math.ceil(projects.length / PROJECTS_PER_SLIDE);

  useEffect(() => {
    if (
      slideCount <= 1 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setInterval(
      () => setSlide((current) => (current + 1) % slideCount),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [slideCount]);

  const visibleProjects = projects.slice(
    slide * PROJECTS_PER_SLIDE,
    (slide + 1) * PROJECTS_PER_SLIDE,
  );
  return (
    <div
      className="featured-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      <div
        className="project-grid featured-projects-grid carousel-slide"
        aria-live="polite"
        key={slide}
      >
        {visibleProjects.map((project) => (
          <Link
            href={`/projects/${project.slug}`}
            key={project.id}
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
            {project.subtitle && (
              <p className="project-card-subtitle">{project.subtitle}</p>
            )}
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
      {slideCount > 1 && (
        <div className="carousel-dots" aria-label="Choose project slide">
          {Array.from({ length: slideCount }, (_, index) => (
            <button
              type="button"
              className={index === slide ? "is-active" : ""}
              aria-label={`Show project slide ${index + 1}`}
              aria-current={index === slide ? "true" : undefined}
              onClick={() => setSlide(index)}
              key={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
