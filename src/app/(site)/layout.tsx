import { SiteFrame } from "@/components/layout/SiteFrame";
import { getPortfolioContent } from "@/features/content/content.repository";
import { getSelectedResume } from "@/features/resume/resume.repository";
import { resumeStorageConfigured } from "@/features/resume/resume.storage";

export default async function PublicSiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = await getPortfolioContent();
  const selectedResume = resumeStorageConfigured()
    ? await getSelectedResume()
    : undefined;

  return (
    <SiteFrame
      visibility={{
        showBlog: content.showBlog,
        showProjects: content.showProjects,
      }}
      resumeAvailable={Boolean(selectedResume)}
    >
      {children}
    </SiteFrame>
  );
}
