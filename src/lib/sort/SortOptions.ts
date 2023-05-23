export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

// Contrast with ASC and DESC, which are absolute ordering terms; whereas
// SortDirection.FORWARD may mean ASC or DESC depending on context.
export enum SortDirection {
  FORWARD,
  REVERSE,
}

export interface SortOption<I = Record<string, any>> {
  field: keyof I;
  direction: SortDirection;
}

type SortOptions<I = Record<string, any>> = SortOption<I>[];

export default SortOptions;
