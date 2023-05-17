import { Relator, Serializer } from "ts-japi";
import Note from "../../orm/entities/Note";
import LabelSerializer from "./LabelSerializer";
import Label from "../../orm/entities/Label";

const NoteSerializer = new Serializer<Partial<Note>>("notes");

export default NoteSerializer;

export const NoteLabelsRelator = new Relator<Partial<Note>, Label>(
  (note) => Promise.resolve(note.labels),
  LabelSerializer,
);
