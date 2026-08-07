"use client";
import { usePathname } from "next/navigation";
import { SwiftGlowingCursor } from "@/components/animations/SwiftGlowingCursor";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
export function SiteFrame({
  children,
  visibility,
}: {
  children: React.ReactNode;
  visibility: { showBlog: boolean; showProjects: boolean };
}) {
  const path = usePathname();
  const privateArea = path === "/login" || path.startsWith("/manage");
  if (privateArea) return <>{children}</>;
  return (
    <>
      <SwiftGlowingCursor />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar visibility={visibility} />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
