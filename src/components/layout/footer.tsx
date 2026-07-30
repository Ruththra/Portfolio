import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <Link href="/#home" className="brand">
          <span>RS</span>
          <strong>Ruththra</strong>
        </Link>
        <p>
          Building thoughtful software, intelligent systems, and expressive
          digital experiences.
        </p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/#skills">Skills</Link>
        <Link href="/#about">About</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/blogs">Blogs</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
      <div className="footer-end">
        <a href="#home" aria-label="Back to top">
          <ArrowUp aria-hidden="true" />
        </a>
        <p>
          © {new Date().getFullYear()} {siteConfig.fullName}
        </p>
      </div>
      <p className="footer-note">
        Built block by block with curiosity and code.
      </p>
    </footer>
  );
}
