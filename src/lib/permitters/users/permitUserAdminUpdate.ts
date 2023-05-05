import { exists } from "../../utils/checks";
import UserAdminUpdateAttributes from "./UserAdminUpdateAttributes";
import permitUserUpdate from "./permitUserUpdate";

export default function permitUserAdminUpdate<T extends UserAdminUpdateAttributes>(
  attrs: T,
): UserAdminUpdateAttributes {
  const updateAttrs = permitUserUpdate(attrs) as UserAdminUpdateAttributes;
  if (exists(attrs.role)) updateAttrs.role = attrs.role;
  return updateAttrs;
}
