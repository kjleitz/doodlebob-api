import Resource from "ts-japi/lib/models/resource.model";
import deserializeUser from "./deserializeUser";
import permitUserCreate from "../../permitters/users/permitUserCreate";
import UserCreateAttributes from "../../permitters/users/UserCreateAttributes";

export default function deserializeUserCreate(resource: Resource<UserCreateAttributes>): UserCreateAttributes {
  const user = deserializeUser(resource);
  const attrs = user as UserCreateAttributes;
  const password = resource.attributes?.password;
  if (password) attrs.password = password;
  return permitUserCreate(attrs);
}
