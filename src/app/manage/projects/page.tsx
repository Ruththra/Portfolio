import { ProjectManager } from "@/components/manage/ProjectManager";
import { VisibilityToggle } from "@/components/manage/VisibilityToggle";
import { getPortfolioContent } from "@/features/content/content.repository";
import { listProjects } from "@/features/projects/project.repository";
import { projectStorageConfigured } from "@/features/projects/project.storage";

export default async function ProjectsManagePage() {
  const [content, projects] = await Promise.all([
    getPortfolioContent(),
    listProjects(),
  ]);
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">CONTENT</p>
          <h1>Projects</h1>
          <p>Upload, order, and manage projects shown on the public site.</p>
        </div>
      </header>
      <VisibilityToggle
        target="projects"
        initial={{
          showBlog: content.showBlog,
          showProjects: content.showProjects,
        }}
      />
      <ProjectManager
        initial={projects}
        configured={projectStorageConfigured()}
      />
    </>
  );
}
