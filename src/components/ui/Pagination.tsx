import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  basePath,
  currentPage,
  hash,
  pageParam = "page",
  totalPages,
}: {
  basePath: string;
  currentPage: number;
  hash?: string;
  pageParam?: string;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const href = (page: number) => {
    const query = page === 1 ? "" : `?${pageParam}=${page}`;
    return `${basePath}${query}${hash ? `#${hash}` : ""}`;
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} aria-label="Previous page">
          <ChevronLeft aria-hidden="true" /> Previous
        </Link>
      ) : (
        <span className="pagination-disabled" aria-disabled="true">
          <ChevronLeft aria-hidden="true" /> Previous
        </span>
      )}
      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <Link
              href={href(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              key={page}
            >
              {page}
            </Link>
          ),
        )}
      </div>
      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)} aria-label="Next page">
          Next <ChevronRight aria-hidden="true" />
        </Link>
      ) : (
        <span className="pagination-disabled" aria-disabled="true">
          Next <ChevronRight aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
