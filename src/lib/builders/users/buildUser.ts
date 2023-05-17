import appDataSource from "../../../orm/config/appDataSource";
import User from "../../../orm/entities/User";
import { UserCreateAttributes } from "../../../server/schemata/jsonApiUsers";
import { setPassword } from "../../auth/passwordUtils";
import { exists } from "../../utils/checks";
import { omit } from "../../utils/objects";

type UserCreateSyncAttributes = Omit<UserCreateAttributes, "password"> & { password?: never };

// Hashing passwords should be done asynchronously, so this can only be used if
// a password is not included in the data. An included password will be ignored.
export function buildUserSync(attrs: UserCreateSyncAttributes): User {
  return appDataSource.getRepository(User).create(attrs);
}

export default function buildUser(attrs: UserCreateAttributes): Promise<User> {
  const user = buildUserSync(omit(attrs, "password"));
  return exists(attrs.password) ? setPassword(user, attrs.password) : Promise.resolve(user);
}
