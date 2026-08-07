import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/#home" className="brand">
            <span>RS</span>
            <strong>{siteConfig.brandName}</strong>
          </Link>
          <p>
            Building thoughtful software, intelligent systems, and expressive
            digital experiences.
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <div>
            <h2>Navigation</h2>
            {siteConfig.navigation.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <h2>Explore</h2>
            <Link href="/projects">Projects</Link>
            <Link href="/blogs">Blogs</Link>
            <Link href="/resume">Resume</Link>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {siteConfig.fullName}. All rights
          reserved.
        </p>
        <div>
          <Link href="/privacy">Privacy</Link>
          <a href="#home" aria-label="Back to top" title="Back to top">
            Back to top
            <ArrowUp aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
