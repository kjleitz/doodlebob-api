import { Serializer } from "ts-japi";
import Label from "../../orm/entities/Label";

const LabelSerializer = new Serializer<Label>("labels");

export default LabelSerializer;
