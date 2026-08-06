"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="manage-panel">
      <h1>Something went wrong</h1>
      <p>The management data could not be loaded.</p>
      <button className="primary-button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
