import appDataSource from "../../../orm/config/appDataSource";
import Note from "../../../orm/entities/Note";
import User from "../../../orm/entities/User";
import { NoteCreateAttributes } from "../../../server/schemata/jsonApiNotes";

type NoteCreateSyncAttributes = NoteCreateAttributes;

// The async version just uses this, so you can use this if you'd like; it's
// async in the default export basically just to match the user builder.
export function buildNoteSync(attrs: NoteCreateSyncAttributes, userId: string): Note {
  const note = appDataSource.getRepository(Note).create(attrs);
  note.user = appDataSource.getRepository(User).create({ id: userId });
  return note;
}

export default function buildNote(attrs: NoteCreateAttributes, userId: string): Promise<Note> {
  const note = buildNoteSync(attrs, userId);
  return Promise.resolve(note);
}
