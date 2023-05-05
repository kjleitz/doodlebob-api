import { pick } from "../../utils/objects";
import UserUpdateAttributes from "./UserUpdateAttributes";

// Use `permitUserAdminUpdate` instead if you want to include the `role` attr.
export default function permitUserUpdate<T extends UserUpdateAttributes>(attrs: T): UserUpdateAttributes {
  return pick(attrs, "username", "email", "oldPassword", "newPassword");
}
