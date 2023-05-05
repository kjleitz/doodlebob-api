import { pick } from "../../utils/objects";
import UserShowAttributes from "./UserShowAttributes";

export default function permitUserShow<T extends UserShowAttributes>(attrs: T): UserShowAttributes {
  return pick(attrs, "id", "username", "email", "role", "createdAt", "updatedAt");
}
