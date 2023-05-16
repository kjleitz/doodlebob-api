import Resource from "ts-japi/lib/models/resource.model";
import Label from "../../../orm/entities/Label";
import appDataSource from "../../../orm/config/appDataSource";

export default function deserializeLabel(resource: Resource<Label>): Label {
  const label = appDataSource.getRepository(Label).create(resource.attributes ?? {});
  if (resource.id) label.id = parseInt(resource.id, 10);
  return label;
}
