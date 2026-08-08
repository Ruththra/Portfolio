export default function Loading() {
  return (
    <div className="manage-loading" role="status" aria-live="polite">
      <header className="manage-loading-header" aria-hidden="true">
        <div>
          <div className="skeleton manage-loading-eyebrow" />
          <div className="skeleton manage-loading-title" />
          <div className="skeleton manage-loading-copy" />
        </div>
        <div className="skeleton manage-loading-button" />
      </header>
      <div className="manage-loading-filters" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="skeleton" key={index} />
        ))}
      </div>
      <div className="manage-panel manage-loading-table" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="manage-loading-row" key={index}>
            <div>
              <div className="skeleton manage-loading-status" />
              <div className="skeleton manage-loading-row-title" />
              <div className="skeleton manage-loading-row-copy" />
            </div>
            <div className="skeleton manage-loading-action" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading management panel</span>
    </div>
  );
}
