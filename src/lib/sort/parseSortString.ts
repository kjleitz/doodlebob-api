import SortOptions, { SortDirection } from "./SortOptions";

// A sort string looks like, e.g., `foobaro,bar.baz,-bampler,blammos`, which
// would be parsed as:
//
//   [
//     { field: "foobaro", direction: SortOrder.FORWARD },
//     { field: "bar.baz", direction: SortOrder.FORWARD },
//     { field: "bampler", direction: SortOrder.REVERSE },
//     { field: "blammos", direction: SortOrder.FORWARD },
//   ]
//
// i.e., a string of comma-separated fields by which to sort some list, where
//       each field is a property of component values of the list, and where
//       dot-separated strings represent nested fields.
//
// This conforms to the description of the `sort` query parameter as detailed by
// the JSON:API spec (see https://jsonapi.org/format/#fetching-sorting).
//
export default function parseSortString(sortString: string): SortOptions {
  return sortString
    .split(",")
    .map((sortField) => {
      const orderedField = sortField.trim();
      const direction = orderedField.charAt(0) === "-" ? SortDirection.REVERSE : SortDirection.FORWARD;
      // Nothin' but word characters (A-Z, a-z, 0-9, and underscore) and periods
      // in a field string.
      const field = orderedField.replace(/[^\w.]/g, "");
      return { field, direction };
    })
    .filter(({ field }) => !!field);
}
