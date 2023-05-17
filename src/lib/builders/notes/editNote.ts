import appDataSource from "../../../orm/config/appDataSource";
import Note from "../../../orm/entities/Note";
import { NoteUpdateAttributes } from "../../../server/schemata/jsonApiNotes";

type NoteUpdateSyncAttributes = NoteUpdateAttributes;

// The async version just uses this, so you can use this if you'd like; it's
// async in the default export basically just to match the user builder/editor.
export function editNoteSync(note: Note, attrs: NoteUpdateSyncAttributes): Note {
  // TODO: test if this mutates the note object (I think it does?)
  return appDataSource.getRepository(Note).merge(note, attrs);
}

// This should return a Note with ONLY the attributes specified set. It mutates
// the given `note` object (I think... TODO: check if TypeORM's `merge` mutates)
// but it returns a different Note object with only the attributes specified in
// `attrs`.
export default function editNote(note: Note, attrs: NoteUpdateAttributes): Promise<Note> {
  const editedNote = editNoteSync(note, attrs);
  return Promise.resolve(editedNote);
}
