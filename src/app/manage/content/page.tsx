import { ContentEditor } from "@/components/manage/ContentEditor";
import { getPortfolioContent } from "@/features/content/content.repository";
export default async function ContentPage() {
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">PORTFOLIO</p>
          <h1>Public content</h1>
          <p>Update content while layout, motion, and design stay in code.</p>
        </div>
      </header>
      <ContentEditor initial={await getPortfolioContent()} />
    </>
  );
}
