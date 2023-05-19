import { PaginationOf } from "ts-japi";
import pageLink from "./pageLink";

export default function pageLinks(
  url: string,
  pageIndex: number,
  pageSize: number,
  totalCount: number,
): PaginationOf<string> {
  const links: PaginationOf<string> = { first: null, last: null, prev: null, next: null };

  if (pageSize <= 0) return links;

  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1); // even 0 results gets a "page"
  const lastPageIndex = totalPages - 1;

  links.first = pageLink(url, 0, pageSize);
  links.last = pageLink(url, lastPageIndex, pageSize);
  if (pageIndex > 0) links.prev = pageLink(url, pageIndex - 1, pageSize);
  if (pageIndex < lastPageIndex) links.next = pageLink(url, pageIndex + 1, pageSize);

  return links;
}
