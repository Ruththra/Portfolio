"use client";

import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

type ResearchItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  imageUrl?: string | null;
  imageAlt: string;
  status: string;
  techStack: Array<{ id: string; name: string }>;
  paper?: { url: string; name: string };
};

const VISIBLE_ITEMS = 3;

export function ResearchCarousel({ items }: { items: ResearchItem[] }) {
  const [slide, setSlide] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const carouselItems = [...items, ...items.slice(0, VISIBLE_ITEMS)];

  useEffect(() => {
    if (isHovered) return;
    const timer = window.setInterval(
      () => setSlide((current) => Math.min(current + 1, items.length)),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [isHovered, items.length]);

  return (
    <div className="featured-carousel" role="region" aria-roledescription="carousel" aria-label="Research" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="featured-carousel__viewport" aria-live="polite">
        <div
          className="featured-carousel__track"
          style={{
            width: `${(carouselItems.length / VISIBLE_ITEMS) * 100}%`,
            transform: `translateX(-${slide * (100 / carouselItems.length)}%)`,
            transition: transitionEnabled ? undefined : "none",
          }}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget || event.propertyName !== "transform" || slide !== items.length) return;
            setTransitionEnabled(false);
            setSlide(0);
            window.requestAnimationFrame(() => window.requestAnimationFrame(() => setTransitionEnabled(true)));
          }}
        >
          {carouselItems.map((item, index) => (
            <div className="carousel-slide" style={{ flexBasis: `${100 / carouselItems.length}%` }} aria-hidden={index !== slide} key={`${item.id}-${index}`}>
              <article className="research-listing">
                <Link className="project-card research-card" href={`/research/${item.slug}`} tabIndex={index === slide ? undefined : -1}>
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.imageAlt} width={640} height={400} />}
                  <h3>{item.title}</h3>
                  {item.subtitle && <p className="project-card-subtitle">{item.subtitle}</p>}
                  <p>{item.abstract}</p>
                  {item.techStack.length > 0 && <ul className="project-card-tech" aria-label="Tech stack">{item.techStack.map((technology) => <li key={technology.id} title={technology.name}>{technology.name}</li>)}</ul>}
                </Link>
                {item.paper && <a className="research-download" href={item.paper.url} download={item.paper.name} target="_blank" rel="noreferrer"><Download aria-hidden="true" /> Download paper</a>}
              </article>
            </div>
          ))}
        </div>
      </div>
      <div className="carousel-dots" aria-label="Choose research slide">
        {items.map((item, index) => <button type="button" className={index === (slide === items.length ? 0 : slide) ? "is-active" : ""} aria-label={`Show research ${index + 1}`} aria-current={index === (slide === items.length ? 0 : slide) ? "true" : undefined} onClick={() => { setTransitionEnabled(true); setSlide(index); }} key={item.id} />)}
      </div>
    </div>
  );
}
