import Resource from "ts-japi/lib/models/resource.model";
import deserializeLabel from "./deserializeLabel";
import permitLabelCreate from "../../permitters/labels/permitLabelCreate";
import LabelCreateAttributes from "../../permitters/labels/LabelCreateAttributes";

export default function deserializeLabelCreate(resource: Resource<LabelCreateAttributes>): LabelCreateAttributes {
  const label = deserializeLabel(resource);
  const attrs = label as LabelCreateAttributes;
  return permitLabelCreate(attrs);
}
