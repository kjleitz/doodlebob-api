import { Serializer } from "ts-japi";
import UserSerializer from "./UserSerializer";
import User from "../../orm/entities/User";
import UnrecognizedEntityError from "../errors/app/UnrecognizedEntityError";

export type DoodlebobEntity = User;

export default function serializerForEntity<E extends DoodlebobEntity>(entity: E): Serializer<E> {
  if (entity instanceof User) return UserSerializer as Serializer<E>;

  throw new UnrecognizedEntityError(entity);
}
