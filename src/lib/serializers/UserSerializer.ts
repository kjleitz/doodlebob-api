import { Serializer } from "ts-japi";
import User from "../../orm/entities/User";

const UserSerializer = new Serializer<Partial<User>>("users", {
  projection: {
    passwordHash: 0,
    notes: 0,
  },
});

export default UserSerializer;
