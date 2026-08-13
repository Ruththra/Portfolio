"use client";

import Image from "next/image";
import Link from "next/link";
import type { TransitionEvent } from "react";
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
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const canScroll = projects.length > PROJECTS_PER_SLIDE;
  const slideCount = canScroll ? projects.length : 1;
  const activeSlide = slide === slideCount ? 0 : slide;

  useEffect(() => {
    if (
      !canScroll ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setInterval(
      () => setSlide((current) => Math.min(current + 1, slideCount)),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [canScroll, slideCount]);

  const projectSlides = canScroll
    ? Array.from({ length: slideCount + 1 }, (_, startIndex) =>
        Array.from(
          { length: PROJECTS_PER_SLIDE },
          (_, offset) => projects[(startIndex + offset) % projects.length],
        ),
      )
    : [projects];

  function finishSlideTransition(event: TransitionEvent<HTMLDivElement>) {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "transform" ||
      slide !== slideCount
    )
      return;

    setTransitionEnabled(false);
    setSlide(0);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setTransitionEnabled(true));
    });
  }

  return (
    <div
      className="featured-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      <div className="featured-carousel__viewport" aria-live="polite">
        <div
          className="featured-carousel__track"
          style={{
            transform: `translateX(-${slide * 100}%)`,
            transition: transitionEnabled ? undefined : "none",
          }}
          onTransitionEnd={finishSlideTransition}
        >
          {projectSlides.map((projectSlide, slideIndex) => (
            <div
              className="project-grid featured-projects-grid carousel-slide"
              aria-hidden={slideIndex !== slide}
              key={`project-window-${slideIndex}`}
            >
              {projectSlide.map((project) => (
                <Link
                  href={`/projects/${project.slug}`}
                  key={project.id}
                  className="project-card"
                  tabIndex={slideIndex === slide ? undefined : -1}
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
          ))}
        </div>
      </div>
      {canScroll && (
        <div className="carousel-dots" aria-label="Choose project slide">
          {Array.from({ length: slideCount }, (_, index) => (
            <button
              type="button"
              className={index === activeSlide ? "is-active" : ""}
              aria-label={`Show project slide ${index + 1}`}
              aria-current={index === activeSlide ? "true" : undefined}
              onClick={() => {
                setTransitionEnabled(true);
                setSlide(index);
              }}
              key={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
