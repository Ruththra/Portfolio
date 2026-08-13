import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer-motto">Be ready to code the world</p>
      <p>
        © {new Date().getFullYear()} {siteConfig.brandName}
      </p>
    </footer>
  );
}
