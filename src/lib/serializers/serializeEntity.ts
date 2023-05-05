import { Serializer } from "ts-japi";
import serializerForEntity, { DoodlebobEntity } from "./serializerForEntity";

const serializeEntity = <E extends DoodlebobEntity>(entity: E): ReturnType<Serializer<E>["serialize"]> => {
  return new Promise<Serializer<E>>((resolve, reject) => {
    try {
      const serializer = serializerForEntity(entity);
      resolve(serializer);
    } catch (e) {
      reject(e);
    }
  }).then((serializer) => serializer.serialize(entity));
};

export default serializeEntity;
