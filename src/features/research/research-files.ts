import type { ProjectFile } from "@/db/schema";

export function getPublicResearchPaper(files: ProjectFile[]) {
  const publicFiles = files.filter((file) => file.isPublic ?? true);
  return (
    publicFiles.find(
      (file) =>
        file.mimeType === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
    ) ?? publicFiles[0]
  );
}
