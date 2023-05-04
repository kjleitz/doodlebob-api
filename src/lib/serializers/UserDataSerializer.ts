import { Serializer } from "ts-japi";
import { UserData } from "../users/userData";

export const UserDataSerializer = new Serializer<UserData>("users");
