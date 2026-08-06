import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/features/projects/projects.data";
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.filter((p) => !p.placeholder).map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project
    ? { title: project.title, description: project.shortDescription }
    : {};
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = getProject((await params).slug);
  if (!project || project.placeholder) notFound();
  return (
    <article className="page-shell article">
      <p className="eyebrow">{project.category}</p>
      <h1>{project.title}</h1>
      <p className="page-lead">{project.longDescription}</p>
      <h2>Problem</h2>
      <p>{project.problem}</p>
      <h2>Solution</h2>
      <p>{project.solution}</p>
      <h2>Technologies</h2>
      <ul className="tag-list">
        {project.technologies.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
