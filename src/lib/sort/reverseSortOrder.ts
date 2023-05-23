import { SortOrder } from "./SortOptions";

export default function reverseSortOrder(sortOrder: SortOrder): SortOrder {
  if (sortOrder == SortOrder.ASC) return SortOrder.DESC;
  if (sortOrder == SortOrder.DESC) return SortOrder.ASC;
  throw new Error(`Unknown sort order: ${sortOrder}`);
}
