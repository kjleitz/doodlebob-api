import { z } from "zod";
import UnprocessableEntityError from "../../../lib/errors/http/UnprocessableEntityError";
import { toParagraph } from "../../../lib/utils/strings";

export default function parseBodyAsSchema<I>(requestBody: any, schema: z.ZodType<I>): I {
  const parsed = schema.safeParse(requestBody);
  if (!parsed.success)
    throw new UnprocessableEntityError(toParagraph(parsed.error.issues.map((issue) => issue.message)), parsed.error);

  return parsed.data;
}
