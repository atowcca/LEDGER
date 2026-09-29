// Supabase/PostgREST silently caps any single query at 1,000 rows (the project
// default) — no error, just truncated data. Anything that must see EVERY row
// (not a display page) has to page through with .range(). Use this for those
// cases; use count queries for totals and server-side .range() for tables.
const PAGE = 1000;

type PageResult<T> = { data: T[] | null; error: { message: string } | null };

export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>
): Promise<T[]> {
  const all: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await fetchPage(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    all.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return all;
}
