import { ResumeManager } from "@/components/manage/ResumeManager";
import { listResumes } from "@/features/resume/resume.repository";
import { resumeStorageConfigured } from "@/features/resume/resume.storage";

export default async function ResumePage() {
  const items = await listResumes();
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">DOCUMENTS</p>
          <h1>Resume</h1>
          <p>Upload and choose the résumé available on the public site.</p>
        </div>
      </header>
      <ResumeManager initial={items} configured={resumeStorageConfigured()} />
    </>
  );
}
