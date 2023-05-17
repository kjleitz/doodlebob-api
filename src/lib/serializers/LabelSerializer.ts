import { Serializer } from "ts-japi";
import Label from "../../orm/entities/Label";

const LabelSerializer = new Serializer<Partial<Label>>("labels");

export default LabelSerializer;
