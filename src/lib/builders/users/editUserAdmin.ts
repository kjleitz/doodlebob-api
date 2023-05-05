import appDataSource from "../../../orm/config/appDataSource";
import User from "../../../orm/entities/User";
import { comparePassword, setPassword } from "../../auth/passwordUtils";
import PasswordMismatchError from "../../errors/app/PasswordMismatchError";
import UserAdminUpdateAttributes from "../../permitters/users/UserAdminUpdateAttributes";
import permitUserAdminUpdate from "../../permitters/users/permitUserAdminUpdate";
import { isNullish } from "../../utils/checks";
import { omit } from "../../utils/objects";

type UserAdminUpdateSyncAttributes = Omit<UserAdminUpdateAttributes, "newPassword" | "oldPassword"> & {
  newPassword?: never;
  oldPassword?: never;
};

// Hashing passwords should be done asynchronously, so this can only be used if
// a password is not included in the data. An included password will be ignored.
export function editUserAdminSync(user: User, attrs: UserAdminUpdateSyncAttributes): User {
  const userAttrs = permitUserAdminUpdate(attrs);
  // TODO: test if this mutates the user object (I think it does?)
  return appDataSource.getRepository(User).merge(user, userAttrs);
}

export default function editUserAdmin(user: User, attrs: UserAdminUpdateAttributes): Promise<User> {
  const editedUser = editUserAdminSync(user, omit(attrs, "newPassword", "oldPassword"));
  const { newPassword, oldPassword } = attrs;

  if (isNullish(newPassword)) return Promise.resolve(editedUser);
  if (isNullish(oldPassword)) return Promise.reject(new PasswordMismatchError());

  return comparePassword(user, oldPassword).then(() => setPassword(editedUser, newPassword));
}
