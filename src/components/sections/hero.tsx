"use client";

import { useRef } from "react";
import Link from "next/link";
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

export function Hero() {
  const heroTrackRef = useRef<HTMLElement>(null);
  const heroStageRef = useRef<HTMLDivElement>(null);

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
        <AvatarSequence
          heroTrackRef={heroTrackRef}
          heroStageRef={heroStageRef}
        />
        <a className="scroll-cue" href="#skills">
          <Mouse aria-hidden="true" />
          Scroll to explore
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
