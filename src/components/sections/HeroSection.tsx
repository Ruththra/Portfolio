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
                  <Icon aria-hidden="true" />
                </a>
              ) : (
                <span
                  key={label}
                  aria-label={`${label} not configured`}
                  title={`${label} not configured`}
                >
                  <Icon aria-hidden="true" />
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
        <a
          className="scroll-cue"
          href="#skills"
          aria-label="Scroll to skills"
          title="Scroll to skills"
        >
          <span className="scroll-cue-icons" aria-hidden="true">
            <Mouse />
            <ArrowDown />
          </span>
        </a>
      </div>
    </section>
  );
}
