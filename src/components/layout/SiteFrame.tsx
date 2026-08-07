import { SwiftGlowingCursor } from "@/components/animations/SwiftGlowingCursor";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
export function SiteFrame({
  children,
  visibility,
  resumeAvailable,
}: {
  children: React.ReactNode;
  visibility: { showBlog: boolean; showProjects: boolean };
  resumeAvailable: boolean;
}) {
  return (
    <>
      <SwiftGlowingCursor />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar visibility={visibility} resumeAvailable={resumeAvailable} />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
