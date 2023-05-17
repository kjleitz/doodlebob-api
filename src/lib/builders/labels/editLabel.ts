import appDataSource from "../../../orm/config/appDataSource";
import Label from "../../../orm/entities/Label";
import { LabelUpdateAttributes } from "../../../server/schemata/jsonApiLabels";

type LabelUpdateSyncAttributes = LabelUpdateAttributes;

// The async version just uses this, so you can use this if you'd like; it's
// async in the default export basically just to match the user builder/editor.
export function editLabelSync(label: Label, attrs: LabelUpdateSyncAttributes): Label {
  // TODO: test if this mutates the label object (I think it does?)
  return appDataSource.getRepository(Label).merge(label, attrs);
}

// This should return a Label with ONLY the attributes specified set. It mutates
// the given `label` object (I think... TODO: check if TypeORM's `merge` mutates)
// but it returns a different Label object with only the attributes specified in
// `attrs`.
export default function editLabel(label: Label, attrs: LabelUpdateAttributes): Promise<Label> {
  const editedLabel = editLabelSync(label, attrs);
  return Promise.resolve(editedLabel);
}
