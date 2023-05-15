import Resource from "ts-japi/lib/models/resource.model";
import Note from "../../../orm/entities/Note";
import appDataSource from "../../../orm/config/appDataSource";

export default function deserializeNote(resource: Resource<Note>): Note {
  const note = appDataSource.getRepository(Note).create(resource.attributes ?? {});
  if (resource.id) note.id = resource.id;
  return note;
}
