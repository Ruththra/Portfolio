import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/manage/LoginForm";
import { getSessionUser } from "@/features/auth/auth";
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};
export default async function LoginPage() {
  let user = null;
  try {
    user = await getSessionUser();
  } catch {
    /* form reports unavailable database */
  }
  if (user) redirect("/manage");
  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">PRIVATE WORKSPACE</p>
        <h1>Management sign in</h1>
        <p>Use your administrator credentials to continue.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </div>
  );
}
