const MATCH_LEFT_SQUARE_BRACKETS = /%5B/gi;
const MATCH_RIGHT_SQUARE_BRACKETS = /%5D/gi;

export default function pageLink(url: string, pageIndex: number, pageSize: number): string {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set("page[index]", "" + pageIndex);
  parsedUrl.searchParams.set("page[size]", "" + pageSize);
  // URLSearchParams annoyingly escapes square brackets.
  return parsedUrl.href.replace(MATCH_LEFT_SQUARE_BRACKETS, "[").replace(MATCH_RIGHT_SQUARE_BRACKETS, "]");
}
