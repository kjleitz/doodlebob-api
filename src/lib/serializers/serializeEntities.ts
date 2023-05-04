import { Serializer } from "ts-japi";
import { DoodlebobEntity } from "./serializeEntity";
import User from "../../orm/entities/User";
import UserDataSerializer from "./UserDataSerializer";
import { userDataFromEntity } from "../users/userData";
import UnrecognizedEntityError from "../errors/app/UnrecognizedEntityError";
import DataSerializer from "./DataSerializer";

const serializeEntities = <E extends DoodlebobEntity>(entities: E[]): ReturnType<Serializer<E[]>["serialize"]> => {
  if (!entities.length) return DataSerializer.serialize([]);

  const sample = entities[0];
  if (sample instanceof User) return UserDataSerializer.serialize(entities.map((item) => userDataFromEntity(item)));

  return Promise.reject(new UnrecognizedEntityError(sample));
};

export default serializeEntities;
