import { Serializer } from "ts-japi";
import { User } from "../../orm/entities/User";
import { UserDataSerializer } from "./UserDataSerializer";
import { userDataFromEntity } from "../users/userData";
import { UnrecognizedEntityError } from "../errors/app/UnrecognizedEntityError";
import { isObject } from "../utils/objects";

export type DoodlebobEntity = User;

export const DataSerializer = new Serializer("data");

export const serializeEntity = <E extends DoodlebobEntity>(entity: E): ReturnType<Serializer<E>["serialize"]> => {
  if (entity instanceof User) return UserDataSerializer.serialize(userDataFromEntity(entity));

  return Promise.reject(new UnrecognizedEntityError(entity));
};

export const serializeEntities = <E extends DoodlebobEntity>(
  entities: E[],
): ReturnType<Serializer<E[]>["serialize"]> => {
  if (!entities.length) return DataSerializer.serialize([]);

  const sample = entities[0];
  if (sample instanceof User) return UserDataSerializer.serialize(entities.map((item) => userDataFromEntity(item)));

  return Promise.reject(new UnrecognizedEntityError(sample));
};

export const serializeData = (data: any): ReturnType<Serializer["serialize"]> => {
  return isObject(data) || (Array.isArray(data) && (!data.length || isObject(data[0])))
    ? DataSerializer.serialize(data)
    : DataSerializer.serialize({ value: data });
};
