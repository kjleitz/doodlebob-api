import { Serializer } from "ts-japi";
import User from "../../orm/entities/User";
import UserDataSerializer from "./UserDataSerializer";
import { userDataFromEntity } from "../users/userData";
import UnrecognizedEntityError from "../errors/app/UnrecognizedEntityError";

export type DoodlebobEntity = User;

const serializeEntity = <E extends DoodlebobEntity>(entity: E): ReturnType<Serializer<E>["serialize"]> => {
  if (entity instanceof User) return UserDataSerializer.serialize(userDataFromEntity(entity));

  return Promise.reject(new UnrecognizedEntityError(entity));
};

export default serializeEntity;
