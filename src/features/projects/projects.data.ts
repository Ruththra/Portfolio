export type Project = {
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  coverImage?: string;
  technologies: readonly string[];
  category: string;
  featured: boolean;
  repositoryUrl?: string;
  liveDemoUrl?: string;
  problem?: string;
  solution?: string;
  responsibilities?: readonly string[];
  technicalDecisions?: readonly string[];
  challenges?: readonly string[];
  outcomes?: readonly string[];
  screenshots?: readonly string[];
  placeholder: boolean;
};

// Replace these records with verified project details. Placeholder records are not rendered as achievements.
export const projects: readonly Project[] = [];
export const featuredProjects = projects.filter(
  (project) => project.featured && !project.placeholder,
);
export const getProject = (slug: string) =>
  projects.find((project) => project.slug === slug);
