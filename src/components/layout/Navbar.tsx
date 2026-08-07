"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, FileText, Folder, Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Navbar({
  visibility = { showBlog: true, showProjects: true },
  resumeAvailable = false,
}: {
  visibility?: { showBlog: boolean; showProjects: boolean };
  resumeAvailable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState("home");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setCompact(window.scrollY > 32);
      const sections = ["contact", "about", "skills", "home"];
      setActive(
        sections.find((id) => {
          const section = document.getElementById(id);
          return section ? section.getBoundingClientRect().top <= 180 : false;
        }) ?? "home",
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>("a,button");
    focusable?.[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && focusable?.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const navLinks = siteConfig.navigation.map((link) => (
    <Link
      key={link.label}
      href={link.href}
      onClick={() => setOpen(false)}
      aria-current={active === link.label.toLowerCase() ? "page" : undefined}
    >
      {link.label}
    </Link>
  ));

  return (
    <header className={`navbar ${compact ? "compact" : ""}`}>
      <nav aria-label="Primary navigation" className="nav-inner">
        <div className="nav-main">
          <Link href="/#home" className="brand" aria-label="Ruththra home">
            <span>RS</span>
            <strong>Ruththra</strong>
          </Link>
          <div className="desktop-links">{navLinks}</div>
        </div>
        <div className="desktop-actions">
          {visibility.showBlog && (
            <Link className="nav-badge" href="/blogs">
              <FileText aria-hidden="true" />
              Blogs
            </Link>
          )}
          {visibility.showProjects && (
            <Link className="nav-badge" href="/projects">
              <Folder aria-hidden="true" />
              Projects
            </Link>
          )}
          {resumeAvailable ? (
            <a className="resume" href="/resume">
              <Download aria-hidden="true" />
              Resume
            </a>
          ) : (
            <span
              className="resume disabled"
              aria-disabled="true"
              title="Résumé not supplied"
            >
              <Download aria-hidden="true" />
              Resume
            </span>
          )}
        </div>
        <button
          className="menu-button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div
          className="mobile-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {navLinks}
            {visibility.showBlog && (
              <Link href="/blogs" onClick={() => setOpen(false)}>
                Blogs
              </Link>
            )}
            {visibility.showProjects && (
              <Link href="/projects" onClick={() => setOpen(false)}>
                Projects
              </Link>
            )}
            {resumeAvailable ? (
              <a href="/resume" onClick={() => setOpen(false)}>
                Download résumé
              </a>
            ) : (
              <span aria-disabled="true">Résumé coming soon</span>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
