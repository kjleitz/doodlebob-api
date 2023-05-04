import { Serializer, isObject } from "ts-japi";
import DataSerializer from "./DataSerializer";

const serializeData = (data: any): ReturnType<Serializer["serialize"]> => {
  return isObject(data) || (Array.isArray(data) && (!data.length || isObject(data[0])))
    ? DataSerializer.serialize(data)
    : DataSerializer.serialize({ value: data });
};

export default serializeData;
