import { Serializer } from "ts-japi";
import User from "../../orm/entities/User";

const UserSerializer = new Serializer<User>("users", {
  projection: {
    passwordHash: 0,
  },
});

export default UserSerializer;
