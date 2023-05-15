import Note from "../../../orm/entities/Note";

type NotePermittedAttributes = Partial<Pick<Note, "title" | "body">>;

export default NotePermittedAttributes;
