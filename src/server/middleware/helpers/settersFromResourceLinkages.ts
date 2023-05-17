import { JsonApiResourceLinkage } from "../../schemata/jsonApiBase";

// This is dumb but I don't care
// Basically just picks the "id" for each linkage and parses the ID string if it
// should be an integer instead.
export default function settersFromResourceLinkages<I extends boolean>(
  linkages?: JsonApiResourceLinkage[],
): { id: string | null }[] | undefined;
export default function settersFromResourceLinkages<I extends boolean>(
  linkages?: JsonApiResourceLinkage[],
  coerceIdToInt?: I,
): (I extends true ? { id: number | null }[] : { id: string | null }[]) | undefined;
export default function settersFromResourceLinkages<I extends boolean>(
  linkages?: JsonApiResourceLinkage[],
  coerceIdToInt?: I,
): { id: number | null }[] | { id: string | null }[] | undefined {
  if (!linkages) return;

  return linkages.map(({ id }) => {
    if (!id) return { id: null };

    return { id: coerceIdToInt ? parseInt("" + id, 10) : id };
  }) as { id: number | null }[] | { id: string | null }[];
}
