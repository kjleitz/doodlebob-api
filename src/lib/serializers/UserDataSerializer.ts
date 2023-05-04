import { Serializer } from "ts-japi";
import { UserData } from "../users/userData";

const UserDataSerializer = new Serializer<UserData>("users");

export default UserDataSerializer;
