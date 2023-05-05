import { exists } from "../../utils/checks";
import UserAdminCreateAttributes from "./UserAdminCreateAttributes";
import permitUserCreate from "./permitUserCreate";

export default function permitUserAdminCreate<T extends UserAdminCreateAttributes>(
  attrs: T,
): UserAdminCreateAttributes {
  const createAttrs = permitUserCreate(attrs) as UserAdminCreateAttributes;
  if (exists(attrs.role)) createAttrs.role = attrs.role;
  return createAttrs;
}
