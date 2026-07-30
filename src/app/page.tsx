import { Hero } from "@/components/sections/hero";
import { Skills } from "@/components/sections/skills";
import { About } from "@/components/sections/about";
import { FeaturedProjects } from "@/components/sections/projects";
import { Journey } from "@/components/sections/journey";
import { BlogPreview } from "@/components/sections/blog-preview";
import { Contact } from "@/components/sections/contact";

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
