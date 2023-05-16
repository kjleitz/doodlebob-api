import Resource from "ts-japi/lib/models/resource.model";
import deserializeLabel from "./deserializeLabel";
import permitLabelUpdate from "../../permitters/labels/permitLabelUpdate";
import LabelUpdateAttributes from "../../permitters/labels/LabelUpdateAttributes";

export default function deserializeLabelUpdate(resource: Resource<LabelUpdateAttributes>): LabelUpdateAttributes {
  const label = deserializeLabel(resource);
  const attrs = label as LabelUpdateAttributes;
  return permitLabelUpdate(attrs);
}
