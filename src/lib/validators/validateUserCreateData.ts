import InvalidInputError from "../errors/app/InvalidInputError";
import { MIN_PASSWORD_LENGTH, VALID_USERNAME_CHARACTERS, isIn, validPassword, validUsername } from "../utils/checkers";
import { ROLES } from "../auth/Role";
import { toSentence } from "../utils/strings";
import { exists } from "../utils/checks";

export const validateUserCreateData = (attrs: Record<string, any>): void => {
  if (!attrs) throw new InvalidInputError("attributes", "No attributes given for create.");

  const { email: _email, password, role, username } = attrs;

  // For various reasons, let's not validate the email. It could be anything.
  // if (email && !validator.isEmail(email)) throw new InvalidInputError("email");

  if (!validPassword(password))
    throw new InvalidInputError("password", `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);

  if (exists(role) && !isIn(role, ROLES)) throw new InvalidInputError("role", "Role is invalid.");

  if (!validUsername(username))
    throw new InvalidInputError(
      "username",
      `Username must only consist of characters ${toSentence(VALID_USERNAME_CHARACTERS.map((char) => `'${char}'`))}`,
    );
};
