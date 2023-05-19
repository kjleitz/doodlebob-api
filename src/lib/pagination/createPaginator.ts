import { Paginator } from "ts-japi";
import pageLinks from "./pageLinks";

export default function createPaginator<T>(
  url: string,
  pageIndex: number,
  pageSize: number,
  totalCount: number,
): Paginator<T> {
  return new Paginator((items) => {
    if (Array.isArray(items)) return pageLinks(url, pageIndex, pageSize, totalCount);
  });
}
