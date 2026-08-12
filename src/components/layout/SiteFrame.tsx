import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BinaryRain } from "@/components/effects/BinaryRain";
export function SiteFrame({
  children,
  visibility,
  resumeAvailable,
}: {
  children: React.ReactNode;
  visibility: {
    showBlog: boolean;
    showProjects: boolean;
    showResearch: boolean;
  };
  resumeAvailable: boolean;
}) {
  return (
    <>
      <BinaryRain />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar visibility={visibility} resumeAvailable={resumeAvailable} />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
