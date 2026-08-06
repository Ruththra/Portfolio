"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ScrollRevealSectionProps = {
  children: ReactNode;
  className: string;
  id: string;
};

export function ScrollRevealSection({
  children,
  className,
  id,
}: ScrollRevealSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    section.dataset.reveal = "ready";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section id={id} className={className} ref={sectionRef}>
      {children}
    </section>
  );
}
