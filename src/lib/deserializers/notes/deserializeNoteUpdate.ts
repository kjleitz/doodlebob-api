import Resource from "ts-japi/lib/models/resource.model";
import deserializeNote from "./deserializeNote";
import permitNoteUpdate from "../../permitters/notes/permitNoteUpdate";
import NoteUpdateAttributes from "../../permitters/notes/NoteUpdateAttributes";

export default function deserializeNoteUpdate(resource: Resource<NoteUpdateAttributes>): NoteUpdateAttributes {
  const note = deserializeNote(resource);
  const attrs = note as NoteUpdateAttributes;
  return permitNoteUpdate(attrs);
}
