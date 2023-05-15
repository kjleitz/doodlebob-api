import { pick } from "../../utils/objects";
import NoteUpdateAttributes from "./NoteUpdateAttributes";

export default function permitNoteUpdate<T extends NoteUpdateAttributes>(attrs: T): NoteUpdateAttributes {
  return pick(attrs, "title", "body");
}
