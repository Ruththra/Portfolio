import { VisibilityToggle } from "@/components/manage/VisibilityToggle";
import { getPortfolioContent } from "@/features/content/content.repository";
import { projects } from "@/features/projects/projects.data";

export default async function ProjectsManagePage() {
  const content = await getPortfolioContent();
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">CONTENT</p>
          <h1>Projects</h1>
          <p>Control whether project content appears on the public site.</p>
        </div>
      </header>
      <VisibilityToggle
        target="projects"
        initial={{
          showBlog: content.showBlog,
          showProjects: content.showProjects,
        }}
      />
      <section className="manage-panel">
        <h2>Project records</h2>
        <p>
          {projects.length
            ? `${projects.length} project record${projects.length === 1 ? "" : "s"} configured.`
            : "No project records are currently configured."}
        </p>
      </section>
    </>
  );
}
