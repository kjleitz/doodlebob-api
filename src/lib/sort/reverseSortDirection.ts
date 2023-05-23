import { SortDirection } from "./SortOptions";

export default function reverseSortDirection(sortDirection: SortDirection): SortDirection {
  if (sortDirection == SortDirection.FORWARD) return SortDirection.REVERSE;
  if (sortDirection == SortDirection.REVERSE) return SortDirection.FORWARD;
  throw new Error(`Unknown sort direction: ${sortDirection}`);
}
