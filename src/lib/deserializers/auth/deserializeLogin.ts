import Resource from "ts-japi/lib/models/resource.model";
import LoginPermittedAttributes from "../../permitters/auth/LoginPermittedAttributes";
import { pick } from "../../utils/objects";

export default function deserializeLogin(resource: Resource<LoginPermittedAttributes>): LoginPermittedAttributes {
  return pick(resource.attributes ?? {}, "username", "password");
}
