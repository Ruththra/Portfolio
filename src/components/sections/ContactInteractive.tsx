"use client";

import { X, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { useRef, useState } from "react";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { hasUrl } from "@/lib/utils";

const socialIcons = {
  Email: Mail,
  LinkedIn: Linkedin,
  GitHub: Github,
  Instagram,
};

type SocialLink = {
  label: keyof typeof socialIcons;
  url: string;
};

export function ContactInteractive({ socials }: { socials: SocialLink[] }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="contact-panel">
      <div className="socials contact-socials" aria-label="Social links">
        {socials.map(({ label, url }) => {
          const Icon = socialIcons[label];
          return hasUrl(url) ? (
            <a
              key={label}
              href={url}
              aria-label={label}
              target={label === "Email" ? undefined : "_blank"}
              rel={label === "Email" ? undefined : "noreferrer"}
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
          );
        })}
      </div>
      <button
        className="button primary contact-toggle"
        type="button"
        ref={toggleRef}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="contact-dialog"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        Get in Touch
      </button>
      <dialog
        ref={dialogRef}
        id="contact-dialog"
        className="contact-dialog"
        aria-labelledby="contact-dialog-title"
        onClose={() => {
          setOpen(false);
          toggleRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            dialogRef.current?.close();
        }}
      >
        <header className="contact-dialog-header">
          <h2 id="contact-dialog-title">Let’s Connect</h2>
          <button
            className="contact-dialog-close"
            type="button"
            aria-label="Close contact form"
            onClick={() => dialogRef.current?.close()}
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <ContactForm />
      </dialog>
    </div>
  );
}
