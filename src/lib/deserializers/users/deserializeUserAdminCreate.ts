import Resource from "ts-japi/lib/models/resource.model";
import deserializeUser from "./deserializeUser";
import permitUserAdminCreate from "../../permitters/users/permitUserAdminCreate";
import UserAdminCreateAttributes from "../../permitters/users/UserAdminCreateAttributes";

export default function deserializeUserAdminCreate(
  resource: Resource<UserAdminCreateAttributes>,
): UserAdminCreateAttributes {
  const user = deserializeUser(resource);
  const attrs = user as UserAdminCreateAttributes;
  const password = resource.attributes?.password;
  if (password) attrs.password = password;
  return permitUserAdminCreate(attrs);
}
