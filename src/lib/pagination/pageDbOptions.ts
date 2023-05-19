import PageOptions from "./PageOptions";

export default function pageDbOptions(pageOptions: PageOptions, maxPageSize: number): { skip: number; take: number } {
  const take = pageOptions.given ? Math.min(pageOptions.size, maxPageSize) : maxPageSize;
  const skip = pageOptions.index * take;
  return { skip, take };
}
