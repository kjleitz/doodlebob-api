import { Serializer } from "ts-japi";
import Note from "../../orm/entities/Note";

const NoteSerializer = new Serializer<Note>("notes");

export default NoteSerializer;
