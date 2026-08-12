import { ResearchManager } from "@/components/manage/ResearchManager";
import { VisibilityToggle } from "@/components/manage/VisibilityToggle";
import { getPortfolioContent } from "@/features/content/content.repository";
import { listResearch } from "@/features/research/research.repository";

export default async function ResearchManagePage() {
  const content = await getPortfolioContent();
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">CONTENT</p>
          <h1>Research</h1>
          <p>Create, organize, and publish research work.</p>
        </div>
      </header>
      <VisibilityToggle
        target="research"
        initial={{
          showBlog: content.showBlog,
          showProjects: content.showProjects,
          showResearch: content.showResearch,
        }}
      />
      <ResearchManager initial={await listResearch()} />
    </>
  );
}
