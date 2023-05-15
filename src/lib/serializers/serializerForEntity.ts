import { Serializer } from "ts-japi";
import Note from "../../orm/entities/Note";
import User from "../../orm/entities/User";
import UnrecognizedEntityError from "../errors/app/UnrecognizedEntityError";
import NoteSerializer from "./NoteSerializer";
import UserSerializer from "./UserSerializer";

export type DoodlebobEntity = User | Note;

export default function serializerForEntity<E extends DoodlebobEntity>(entity: E): Serializer<E> {
  if (entity instanceof User) return UserSerializer as Serializer<E>;
  if (entity instanceof Note) return NoteSerializer as Serializer<E>;

  throw new UnrecognizedEntityError(entity);
}
