import appDataSource from "../../../orm/config/appDataSource";
import User from "../../../orm/entities/User";
import { setPassword } from "../../auth/passwordUtils";
import UserAdminCreateAttributes from "../../permitters/users/UserAdminCreateAttributes";
import permitUserAdminCreate from "../../permitters/users/permitUserAdminCreate";
import { exists } from "../../utils/checks";
import { omit } from "../../utils/objects";

type UserAdminCreateSyncAttributes = Omit<UserAdminCreateAttributes, "password"> & { password?: never };

// Hashing passwords should be done asynchronously, so this can only be used if
// a password is not included in the data. An included password will be ignored.
export function buildUserAdminSync(attrs: UserAdminCreateSyncAttributes): User {
  const userAttrs = permitUserAdminCreate(attrs);
  return appDataSource.getRepository(User).create(userAttrs);
}

export default function buildUserAdmin(attrs: UserAdminCreateAttributes): Promise<User> {
  const user = buildUserAdminSync(omit(attrs, "password"));
  return exists(attrs.password) ? setPassword(user, attrs.password) : Promise.resolve(user);
}
