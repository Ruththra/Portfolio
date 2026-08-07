import { NextResponse } from "next/server";
import { getSelectedResume } from "@/features/resume/resume.repository";
import {
  createResumeDownloadUrl,
  resumeStorageConfigured,
} from "@/features/resume/resume.storage";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!resumeStorageConfigured())
    return NextResponse.json(
      { message: "Résumé unavailable." },
      { status: 404 },
    );
  const resume = await getSelectedResume();
  if (!resume)
    return NextResponse.json(
      { message: "Résumé unavailable." },
      { status: 404 },
    );
  const url = await createResumeDownloadUrl(
    resume.storagePath,
    resume.fileName,
  );
  return NextResponse.redirect(url);
}
