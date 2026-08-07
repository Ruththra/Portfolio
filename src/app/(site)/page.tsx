import { Hero } from "@/components/sections/HeroSection";
import { Skills } from "@/components/sections/SkillsSection";
import { About } from "@/components/sections/AboutSection";
import { FeaturedProjects } from "@/components/sections/ProjectsSection";
import { BlogPreview } from "@/components/sections/BlogPreviewSection";
import { Contact } from "@/components/sections/ContactSection";
import { getPortfolioContent } from "@/features/content/content.repository";

export default async function Home() {
  const content = await getPortfolioContent();
  return (
    <>
      <Hero />
      <Skills />
      <About />
      {content.showProjects && <FeaturedProjects />}
      {content.showBlog && <BlogPreview />}
      <Contact />
    </>
  );
}
