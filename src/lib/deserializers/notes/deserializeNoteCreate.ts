import Resource from "ts-japi/lib/models/resource.model";
import deserializeNote from "./deserializeNote";
import permitNoteCreate from "../../permitters/notes/permitNoteCreate";
import NoteCreateAttributes from "../../permitters/notes/NoteCreateAttributes";

export default function deserializeNoteCreate(resource: Resource<NoteCreateAttributes>): NoteCreateAttributes {
  const note = deserializeNote(resource);
  const attrs = note as NoteCreateAttributes;
  return permitNoteCreate(attrs);
}
