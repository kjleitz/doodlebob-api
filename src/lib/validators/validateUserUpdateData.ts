import UserAdminUpdateAttributes from "../permitters/users/UserAdminUpdateAttributes";
import InvalidInputError from "../errors/app/InvalidInputError";
import { MIN_PASSWORD_LENGTH, VALID_USERNAME_CHARACTERS, isIn, validPassword, validUsername } from "../utils/checkers";
import { ROLES } from "../auth/Role";
import { toSentence } from "../utils/strings";
import { exists, isNullish } from "../utils/checks";

export const validateUserUpdateData = (attrs: UserAdminUpdateAttributes): void => {
  if (!attrs) throw new InvalidInputError("attributes", "No attributes given for update.");

  const { email: _email, oldPassword, newPassword, role, username } = attrs;

  // For various reasons, let's not validate the email. It could be anything.
  // if (email && !validator.isEmail(email)) throw new InvalidInputError("email");

  if (exists(newPassword) && !validPassword(newPassword))
    throw new InvalidInputError("newPassword", `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);

  if (exists(newPassword) && !oldPassword)
    throw new InvalidInputError("oldPassword", `Must provide old password in order to change password.`);

  if (exists(role) && !isIn(role, ROLES)) throw new InvalidInputError("role", "Role is invalid.");

  if (exists(username) && !validUsername(username))
    throw new InvalidInputError(
      "username",
      `Username must only consist of characters ${toSentence(VALID_USERNAME_CHARACTERS.map((char) => `'${char}'`))}`,
    );
};
