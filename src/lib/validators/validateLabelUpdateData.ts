import LabelUpdateAttributes from "../permitters/labels/LabelUpdateAttributes";
import InvalidInputError from "../errors/app/InvalidInputError";
import { exists } from "../utils/checks";

export const validateLabelUpdateData = (attrs: LabelUpdateAttributes): void => {
  if (!attrs) throw new InvalidInputError("attributes", "No attributes given for update.");

  const { name } = attrs;
  if (name === null) throw new InvalidInputError("name", "Label name must not be empty.");
  if (exists(name) && typeof name !== "string") throw new InvalidInputError("name", "Label name must be a string.");
};
