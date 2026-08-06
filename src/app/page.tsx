import { Hero } from "@/components/sections/HeroSection";
import { Skills } from "@/components/sections/SkillsSection";
import { About } from "@/components/sections/AboutSection";
import { FeaturedProjects } from "@/components/sections/ProjectsSection";
import { Journey } from "@/components/sections/JourneySection";
import { BlogPreview } from "@/components/sections/BlogPreviewSection";
import { Contact } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <Hero />
      <Skills />
      <About />
      <FeaturedProjects />
      <Journey />
      <BlogPreview />
      <Contact />
    </>
  );
}
