import { Serializer } from "ts-japi";
import User from "../../orm/entities/User";
import { UserUpdateAttributes } from "../../server/schemata/jsonApiUsers";

const UserUpdateSerializer = new Serializer<Partial<UserUpdateAttributes>>("users");

export default UserUpdateSerializer;
