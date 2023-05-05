import Resource from "ts-japi/lib/models/resource.model";
import deserializeUser from "./deserializeUser";
import permitUserAdminUpdate from "../../permitters/users/permitUserAdminUpdate";
import UserAdminUpdateAttributes from "../../permitters/users/UserAdminUpdateAttributes";

export default function deserializeUserAdminUpdate(
  resource: Resource<UserAdminUpdateAttributes>,
): UserAdminUpdateAttributes {
  const user = deserializeUser(resource);
  const attrs = user as UserAdminUpdateAttributes;
  const newPassword = resource.attributes?.newPassword;
  const oldPassword = resource.attributes?.oldPassword;
  if (newPassword) attrs.newPassword = newPassword;
  if (oldPassword) attrs.oldPassword = oldPassword;
  return permitUserAdminUpdate(attrs);
}
