import type { Metadata } from "next";
import { ManageNav } from "@/components/manage/ManageNav";
import { requireAdmin } from "@/features/auth/auth";
export const metadata: Metadata = {
  title: { default: "Management", template: "%s · Management" },
  robots: { index: false, follow: false },
};
export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="manage-shell">
      <a className="skip-link" href="#manage-content">
        Skip to management content
      </a>
      <ManageNav />
      <main className="manage-main" id="manage-content">
        {children}
      </main>
    </div>
  );
}
