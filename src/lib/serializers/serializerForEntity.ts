import { Serializer } from "ts-japi";
import Note from "../../orm/entities/Note";
import User from "../../orm/entities/User";
import UnrecognizedEntityError from "../errors/app/UnrecognizedEntityError";
import NoteSerializer from "./NoteSerializer";
import UserSerializer from "./UserSerializer";
import Label from "../../orm/entities/Label";
import LabelSerializer from "./LabelSerializer";

export type DoodlebobEntity = Label | Note | User;

export default function serializerForEntity<E extends DoodlebobEntity>(entity: E): Serializer<E> {
  if (entity instanceof User) return UserSerializer as Serializer<E>;
  if (entity instanceof Note) return NoteSerializer as Serializer<E>;
  if (entity instanceof Label) return LabelSerializer as Serializer<E>;

  throw new UnrecognizedEntityError(entity);
}
