"use client";

import { ChevronDown, Github, Instagram, Linkedin, Mail, Rocket } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [hasScrolled, setHasScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const atBottomRef = useRef(false);

  useEffect(() => {
    const updateBottomState = () => {
      const reachedBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;

      if (reachedBottom) {
        setOpen(false);
        setIsHiding(false);
        setHasScrolled(true);
        if (!atBottomRef.current) {
          atBottomRef.current = true;
          setAtBottom(true);
          hideTimeoutRef.current = setTimeout(() => {
            setHasScrolled(false);
            hideTimeoutRef.current = null;
          }, 650);
        }
        return;
      }

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      const wasAtBottom = atBottomRef.current;
      atBottomRef.current = false;
      setAtBottom(false);
      if (window.scrollY <= 0) {
        setOpen(false);
        setIsReturning(false);
        setIsHiding(true);
        setHasScrolled(true);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
          setHasScrolled(false);
          setIsHiding(false);
          hideTimeoutRef.current = null;
        }, 620);
        return;
      }

      setIsHiding(false);
      setHasScrolled(true);
      if (wasAtBottom) {
        setIsReturning(true);
        window.setTimeout(() => setIsReturning(false), 520);
      }
    };
    const onScroll = () => {
      setOpen(false);
      updateBottomState();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const isVisible = hasScrolled;

  const links = [
    ["Email", email ? `mailto:${email}` : "", Mail],
    ["LinkedIn", linkedin, Linkedin],
    ["GitHub", github, Github],
    ["Instagram", instagram, Instagram],
  ] as const;

  return (
    <div
      className={`contact-reveal ${open ? "is-open" : ""} ${atBottom || isHiding ? "is-leaving" : ""} ${isReturning ? "is-returning" : ""} ${isVisible ? "" : "is-hidden"}`}
    >
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
          <Rocket aria-hidden="true" />
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
