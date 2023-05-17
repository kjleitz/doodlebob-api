import appDataSource from "../../../orm/config/appDataSource";
import Label from "../../../orm/entities/Label";
import User from "../../../orm/entities/User";
import { LabelCreateAttributes } from "../../../server/schemata/jsonApiLabels";

type LabelCreateSyncAttributes = LabelCreateAttributes;

// The async version just uses this, so you can use this if you'd like; it's
// async in the default export basically just to match the user builder.
export function buildLabelSync(attrs: LabelCreateSyncAttributes, userId: string): Label {
  const label = appDataSource.getRepository(Label).create(attrs);
  label.user = appDataSource.getRepository(User).create({ id: userId });
  return label;
}

export default function buildLabel(attrs: LabelCreateAttributes, userId: string): Promise<Label> {
  const label = buildLabelSync(attrs, userId);
  return Promise.resolve(label);
}
