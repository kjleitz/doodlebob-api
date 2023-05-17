import InvalidInputError from "../errors/app/InvalidInputError";
import { exists } from "../utils/checks";

export const validateNoteUpdateData = (attrs: Record<string, any>): void => {
  if (!attrs) throw new InvalidInputError("attributes", "No attributes given for update.");

  // const { title, body, labels } = attrs;
  const { title, body } = attrs;

  // These are kind of cop-outs, only because both title and body are allowed to
  // be empty, so /shrug.
  if (exists(title) && typeof title !== "string") throw new InvalidInputError("title");
  if (exists(body) && typeof body !== "string") throw new InvalidInputError("body");
  // if (exists(labels) && !Array.isArray(labels)) throw new InvalidInputError("labels", "Labels must be an array");
};
