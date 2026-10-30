"use client";

import { ChevronDown, Github, Instagram, Linkedin, Mail, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { hasUrl } from "@/lib/utils";

type ContactRevealProps = {
  email: string;
  linkedin: string;
  github: string;
  instagram: string;
};

export function ContactReveal({
  email,
  linkedin,
  github,
  instagram,
}: ContactRevealProps) {
  const [open, setOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const updateBottomState = () => {
      setAtBottom(
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80,
      );
    };
    const onScroll = () => {
      setOpen(false);
      updateBottomState();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateBottomState();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    ["Email", email ? `mailto:${email}` : "", Mail],
    ["LinkedIn", linkedin, Linkedin],
    ["GitHub", github, Github],
    ["Instagram", instagram, Instagram],
  ] as const;

  return (
    <div className={`contact-reveal ${open ? "is-open" : ""}`}>
      <button
        className={`button primary contact-reveal-trigger ${atBottom ? "is-bottom-visible" : ""}`}
        type="button"
        aria-label={open ? "Hide contact links" : "Show contact links"}
        title={open ? "Hide contact links" : "Show contact links"}
        aria-expanded={open}
        aria-controls="hero-contact-mailboxes"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <ChevronDown aria-hidden="true" />
        ) : atBottom ? (
          <>Get in Touch <Rocket aria-hidden="true" /></>
        ) : (
          <Rocket aria-hidden="true" />
        )}
      </button>
      <div
        className="contact-mailboxes"
        id="hero-contact-mailboxes"
        aria-label="Contact links"
      >
        {links.map(([label, url, Icon], index) =>
          hasUrl(url) ? (
            <a
              key={label}
              className={`contact-mailbox contact-mailbox-${index + 1}`}
              href={url}
              aria-label={label}
              tabIndex={open ? 0 : -1}
              target={label === "Email" ? undefined : "_blank"}
              rel={label === "Email" ? undefined : "noreferrer"}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </a>
          ) : (
            <span
              key={label}
              className={`contact-mailbox contact-mailbox-${index + 1} is-disabled`}
              aria-label={`${label} not configured`}
              title={`${label} not configured`}
              aria-hidden={!open}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </span>
          ),
        )}
      </div>
    </div>
  );
}
