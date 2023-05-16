import { pick } from "../../utils/objects";
import LabelUpdateAttributes from "./LabelUpdateAttributes";

export default function permitLabelUpdate<T extends LabelUpdateAttributes>(attrs: T): LabelUpdateAttributes {
  return pick(attrs, "name");
}
