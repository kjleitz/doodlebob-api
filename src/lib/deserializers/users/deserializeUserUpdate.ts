import Resource from "ts-japi/lib/models/resource.model";
import deserializeUser from "./deserializeUser";
import permitUserUpdate from "../../permitters/users/permitUserUpdate";
import UserUpdateAttributes from "../../permitters/users/UserUpdateAttributes";

export default function deserializeUserUpdate(resource: Resource<UserUpdateAttributes>): UserUpdateAttributes {
  const user = deserializeUser(resource);
  const attrs = user as UserUpdateAttributes;
  const newPassword = resource.attributes?.newPassword;
  const oldPassword = resource.attributes?.oldPassword;
  if (newPassword) attrs.newPassword = newPassword;
  if (oldPassword) attrs.oldPassword = oldPassword;
  return permitUserUpdate(attrs);
}
