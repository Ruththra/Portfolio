"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Mouse,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { hasUrl } from "@/lib/utils";
import { TypingText } from "@/components/animations/typing-text";
import { AvatarSequence } from "@/components/animations/avatar-scene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Hero() {
  const heroTrackRef = useRef<HTMLElement>(null);
  const heroStageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = heroTrackRef.current;
      const stage = heroStageRef.current;

      if (!track || !stage) return;

      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 1024px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions as {
            desktop: boolean;
            reduceMotion: boolean;
          };

          gsap.set(".hood", { opacity: 1, scale: 1 });

          if (!desktop || reduceMotion) return;

          gsap.set(".hood", { opacity: 0.12, scale: 0.94 });
          gsap.set(".sweep", { xPercent: 0, opacity: 0 });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              id: "hero-avatar-sequence",
              trigger: track,
              start: "top top",
              end: () => `+=${Math.max(window.innerHeight * 3.5, 2800)}`,
              pin: stage,
              pinSpacing: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              markers: process.env.NODE_ENV === "development",
            },
          });

          timeline
            .addLabel("real", 0)
            .to(".avatar-core", { scale: 1.018, yPercent: -0.5 }, 0)
            .addLabel("cartoon", 0.25)
            .to(".sweep", { xPercent: 230, opacity: 0.8 }, 0.25)
            .to(
              ".avatar-core",
              { scale: 1.04, filter: "drop-shadow(0 0 28px #238bff)" },
              0.25,
            )
            .to(".orbit-one", { rotate: 55, scale: 1.08 }, 0.25)
            .to(".orbit-two", { rotate: -40 }, 0.25)
            .to(".nebula", { scale: 1.12, opacity: 0.26 }, 0.25)
            .addLabel("hoodie", 0.55)
            .to(".hood", { opacity: 1, scale: 1 }, 0.55)
            .addLabel("blink", 0.78)
            .to(
              ".eye",
              { scaleY: 0.08, duration: 0.04, yoyo: true, repeat: 1 },
              0.78,
            )
            .addLabel("final", 1);

          const refreshAfterLayout = async () => {
            const images = Array.from(
              stage.querySelectorAll<HTMLImageElement>("img"),
            );
            await Promise.all(
              images.map(async (image) => {
                if (!image.complete) {
                  await new Promise<void>((resolve) => {
                    image.addEventListener("load", () => resolve(), {
                      once: true,
                    });
                    image.addEventListener("error", () => resolve(), {
                      once: true,
                    });
                  });
                }
                await image.decode().catch(() => undefined);
              }),
            );
            await document.fonts.ready;
            requestAnimationFrame(() => ScrollTrigger.refresh());
          };

          void refreshAfterLayout();
        },
      );

      return () => media.revert();
    },
    { scope: heroTrackRef },
  );

  const socials = [
    ["Email", siteConfig.email ? `mailto:${siteConfig.email}` : "", Mail],
    ["LinkedIn", siteConfig.socials.linkedin, Linkedin],
    ["GitHub", siteConfig.socials.github, Github],
    ["Instagram", siteConfig.socials.instagram, Instagram],
  ] as const;
  return (
    <section ref={heroTrackRef} id="home" className="hero-track">
      <div ref={heroStageRef} className="hero">
        <div className="hero-copy">
          <p className="status">
            <span />
            Available for opportunities
          </p>
          <p className="greeting">Hello! I’m</p>
          <h1>
            Ruththiragayan <span>Sutharsan</span>
          </h1>
          <TypingText />
          <p className="hero-support">
            As I like to be unique, I built this creative portfolio block by
            block with my own idea bits.
          </p>
          <p className="role">
            Full-Stack Developer <b>·</b> Creative Designer <b>·</b> Passionate
            Learner
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="#projects">
              View My Work <ArrowDown />
            </Link>
            <Link className="button secondary" href="#contact">
              Let’s Connect
            </Link>
          </div>
          <div className="socials" aria-label="Social links">
            {socials.map(([label, url, Icon]) =>
              hasUrl(url) ? (
                <a
                  key={label}
                  href={url}
                  aria-label={label}
                  target={label === "Email" ? undefined : "_blank"}
                  rel="noreferrer"
                >
                  <Icon />
                </a>
              ) : (
                <span
                  key={label}
                  aria-label={`${label} not configured`}
                  title={`${label} not configured`}
                >
                  <Icon />
                </span>
              ),
            )}
          </div>
          <p className="location">
            <MapPin aria-hidden="true" />
            Based in Sri Lanka · Open to remote opportunities
          </p>
        </div>
        <AvatarSequence />
        <a className="scroll-cue" href="#skills">
          <Mouse aria-hidden="true" />
          Scroll to explore
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
