import UnauthorizedError from "../../lib/errors/http/UnauthorizedError";
import { comparePassword } from "../../lib/users/auth";
import appDataSource from "../../orm/config/appDataSource";
import User from "../../orm/entities/User";
import Controller, { Verb } from "../Controller";

const auth = new Controller();
const userRepository = appDataSource.getRepository(User);

auth.on(Verb.POST, "/login", [], (req) => {
  const { username, password } = req.body;
  return userRepository
    .findOneBy({ username })
    .then((user) => comparePassword(user, password))
    .then((user) => {
      const jwtPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });
});
