export const PUBLIC_PAGE_SIZE = 3;

export function paginate<T>(
  items: readonly T[],
  rawPage: string | string[] | undefined,
  pageSize = PUBLIC_PAGE_SIZE,
) {
  const requested = Number(Array.isArray(rawPage) ? rawPage[0] : rawPage);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(
    totalPages,
    Number.isInteger(requested) && requested > 0 ? requested : 1,
  );
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    totalPages,
  };
}
