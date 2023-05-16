import Label from "../../../orm/entities/Label";

type LabelPermittedAttributes = Partial<Pick<Label, "name">>;

export default LabelPermittedAttributes;
