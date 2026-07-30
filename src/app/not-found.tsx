import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-shell not-found">
      <p className="eyebrow">404 · OFF ORBIT</p>
      <h1>This page drifted out of view.</h1>
      <p>The route may have moved, or the content is still being built.</p>
      <Link href="/" className="button primary">
        Return home
      </Link>
    </div>
  );
}
