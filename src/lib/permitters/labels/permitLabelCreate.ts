import { pick } from "../../utils/objects";
import LabelCreateAttributes from "./LabelCreateAttributes";

export default function permitLabelCreate<T extends LabelCreateAttributes>(attrs: T): LabelCreateAttributes {
  return pick(attrs, "name");
}
