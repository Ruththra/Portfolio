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
import { hasUrl } from "@/lib/utils";
import { TypingText } from "@/components/animations/TypingText";
import { AvatarSequence } from "@/features/avatar/components/AvatarScene";
import { getPortfolioContent } from "@/features/content/content.repository";

export async function Hero() {
  const content = await getPortfolioContent();
  const socials = [
    ["Email", content.email ? `mailto:${content.email}` : "", Mail],
    ["LinkedIn", content.linkedin, Linkedin],
    ["GitHub", content.github, Github],
    ["Instagram", content.instagram, Instagram],
  ] as const;
  return (
    <section id="home" className="hero-track">
      <div className="hero">
        <div className="hero-copy">
          <p className="status">
            <span />
            Available for opportunities
          </p>
          <p className="greeting">Hello! I’m</p>
          <h1>{content.heroHeading}</h1>
          <TypingText />
          <p className="hero-support">{content.heroIntroduction}</p>
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
            {content.location} · Open to remote opportunities
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
