import NoteUpdateAttributes from "../permitters/notes/NoteUpdateAttributes";
import InvalidInputError from "../errors/app/InvalidInputError";
import { exists } from "../utils/checks";

export const validateNoteUpdateData = (attrs: NoteUpdateAttributes): void => {
  if (!attrs) throw new InvalidInputError("attributes", "No attributes given for update.");

  const { title, body } = attrs;

  // These are kind of cop-outs, only because both title and body are allowed to
  // be empty, so /shrug.
  if (exists(title) && typeof title !== "string") throw new InvalidInputError("title");
  if (exists(body) && typeof body !== "string") throw new InvalidInputError("body");
};
