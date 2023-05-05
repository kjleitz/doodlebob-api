import { Serializer } from "ts-japi";
import DataSerializer from "./DataSerializer";
import serializerForEntity, { DoodlebobEntity } from "./serializerForEntity";

const serializeEntities = <E extends DoodlebobEntity>(entities: E[]): ReturnType<Serializer<E[]>["serialize"]> => {
  if (!entities.length) return DataSerializer.serialize([]);

  return new Promise<Serializer<E>>((resolve, reject) => {
    try {
      const sample = entities[0];
      const serializer = serializerForEntity(sample);
      resolve(serializer);
    } catch (e) {
      reject(e);
    }
  }).then((serializer) => serializer.serialize(entities));
};

export default serializeEntities;
