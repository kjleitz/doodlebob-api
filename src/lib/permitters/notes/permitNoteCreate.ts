import { pick } from "../../utils/objects";
import NoteCreateAttributes from "./NoteCreateAttributes";

export default function permitNoteCreate<T extends NoteCreateAttributes>(attrs: T): NoteCreateAttributes {
  return pick(attrs, "title", "body");
}
