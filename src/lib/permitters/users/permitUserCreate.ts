import { pick } from "../../utils/objects";
import UserCreateAttributes from "./UserCreateAttributes";

// Use `permitUserAdminCreate` instead if you want to include the `role` attr.
export default function permitUserCreate<T extends UserCreateAttributes>(attrs: T): UserCreateAttributes {
  return pick(attrs, "username", "email", "password");
}
