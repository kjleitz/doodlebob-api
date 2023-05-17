import appDataSource from "../../../orm/config/appDataSource";
import User from "../../../orm/entities/User";
import { UserUpdateAttributes } from "../../../server/schemata/jsonApiUsers";
import { comparePassword, setPassword } from "../../auth/passwordUtils";
import PasswordMismatchError from "../../errors/app/PasswordMismatchError";
import { isNullish } from "../../utils/checks";
import { omit } from "../../utils/objects";

type UserUpdateSyncAttributes = Omit<UserUpdateAttributes, "newPassword" | "oldPassword"> & {
  newPassword?: never;
  oldPassword?: never;
};

// Hashing passwords should be done asynchronously, so this can only be used if
// a password is not included in the data. An included password will be ignored.
export function editUserSync(user: User, attrs: UserUpdateSyncAttributes): User {
  // TODO: test if this mutates the user object (I think it does?)
  return appDataSource.getRepository(User).merge(user, attrs);
}

// This should return a User with ONLY the attributes specified set. It mutates
// the given `user` object (I think... TODO: check if TypeORM's `merge` mutates)
// but it returns a different User object with only the attributes specified in
// `attrs` plus a `passwordHash` if `newPassword`/`oldPassword` were included.
export default function editUser(user: User, attrs: UserUpdateAttributes): Promise<User> {
  const editedUser = editUserSync(user, omit(attrs, "newPassword", "oldPassword"));
  const { newPassword, oldPassword } = attrs;

  if (isNullish(newPassword)) return Promise.resolve(editedUser);
  if (isNullish(oldPassword)) return Promise.reject(new PasswordMismatchError());

  return comparePassword(user, oldPassword).then(() => setPassword(editedUser, newPassword));
}
