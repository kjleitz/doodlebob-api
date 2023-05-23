import { FindOptionsOrder } from "typeorm";
import SortOptions, { SortDirection, SortOrder } from "./SortOptions";
import reverseSortOrder from "./reverseSortOrder";

export default function orderFromSortOptions<T, D extends keyof T>(
  sortOptions: SortOptions<T>,
  defaultFieldToOrderByIfEmpty: D,
  defaultOrders: { [key in D]: SortOrder } & Partial<Record<keyof T, SortOrder>>,
): FindOptionsOrder<T> {
  let foundAllowedField = false;

  const result = sortOptions.reduce((order, { field, direction }) => {
    const defaultOrder: SortOrder = defaultOrders[field];
    if (!defaultOrder) return order; // the only allowed fields are those with a supplied default order

    order[field] = direction === SortDirection.FORWARD ? defaultOrder : reverseSortOrder(defaultOrder);
    foundAllowedField = true;
    return order;
  }, {} as Record<keyof T, SortOrder>);

  if (foundAllowedField) return result as FindOptionsOrder<T>;

  return { [defaultFieldToOrderByIfEmpty]: defaultOrders[defaultFieldToOrderByIfEmpty] } as FindOptionsOrder<T>;
}
