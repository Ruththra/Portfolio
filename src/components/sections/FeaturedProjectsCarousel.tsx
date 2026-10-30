"use client";

import Image from "next/image";
import Link from "next/link";
import type { TransitionEvent } from "react";
import { useEffect, useState } from "react";

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

const VISIBLE_PROJECTS = 3;

export function FeaturedProjectsCarousel({
  projects,
}: {
  projects: FeaturedProject[];
}) {
  const [slide, setSlide] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const canScroll = projects.length > VISIBLE_PROJECTS;
  const slideCount = canScroll ? projects.length : 1;
  const activeSlide = slide === slideCount ? 0 : slide;

  useEffect(() => {
    if (
      !canScroll ||
      isHovered ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setInterval(
      () => setSlide((current) => Math.min(current + 1, slideCount)),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [canScroll, isHovered, slideCount]);

  const carouselProjects = canScroll
    ? [...projects, ...projects.slice(0, VISIBLE_PROJECTS)]
    : projects;

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="featured-carousel__viewport" aria-live="polite">
        <div
          className="featured-carousel__track"
          style={{
            width: `${(carouselProjects.length / VISIBLE_PROJECTS) * 100}%`,
            transform: `translateX(-${slide * (100 / carouselProjects.length)}%)`,
            transition: transitionEnabled ? undefined : "none",
          }}
          onTransitionEnd={finishSlideTransition}
        >
          {carouselProjects.map((project, slideIndex) => (
            <div
              className="carousel-slide"
              style={{ flexBasis: `${100 / carouselProjects.length}%` }}
              aria-hidden={slideIndex !== slide}
              key={`${project.id}-${slideIndex}`}
            >
              <Link
                href={`/projects/${project.slug}`}
                className="project-card"
                tabIndex={slideIndex === slide ? undefined : -1}
              >
                <Image src={project.imageUrl} alt={project.imageAlt} width={640} height={400} />
                <h3>{project.title}</h3>
                {project.subtitle && <p className="project-card-subtitle">{project.subtitle}</p>}
                <p>{project.description}</p>
                {project.techStack.length > 0 && (
                  <ul className="project-card-tech" aria-label="Tech stack">
                    {project.techStack.map((technology) => (
                      <li key={technology.id} title={technology.name}>{technology.name}</li>
                    ))}
                  </ul>
                )}
              </Link>
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
