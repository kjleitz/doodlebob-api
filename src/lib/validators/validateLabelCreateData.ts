import LabelCreateAttributes from "../permitters/labels/LabelCreateAttributes";
import InvalidInputError from "../errors/app/InvalidInputError";

export const validateLabelCreateData = (attrs: LabelCreateAttributes): void => {
  if (!attrs) throw new InvalidInputError("attributes", "No attributes given for create.");

  const { name } = attrs;
  if (!name) throw new InvalidInputError("name", "Label name must not be empty.");
  if (typeof name !== "string") throw new InvalidInputError("name", "Label name must be a string.");
};
