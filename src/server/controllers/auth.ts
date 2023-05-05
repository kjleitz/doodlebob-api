import { comparePassword } from "../../lib/auth/passwordUtils";
import appDataSource from "../../orm/config/appDataSource";
import User from "../../orm/entities/User";
import Controller, { Verb } from "../Controller";
import jwtTokenForUser from "../../lib/auth/jwtTokenForUser";
import deserializeUserCreate from "../../lib/deserializers/users/deserializeUserCreate";
import buildUser from "../../lib/builders/users/buildUser";
import deserializeLogin from "../../lib/deserializers/auth/deserializeLogin";
import UnauthorizedError from "../../lib/errors/http/UnauthorizedError";

const auth = new Controller();
const userRepository = appDataSource.getRepository(User);

auth.on(Verb.POST, "/signIn", [], (req, res) => {
  const { username, password } = deserializeLogin(req.body.data);
  if (!username) throw new UnauthorizedError("Must provide a username.");
  if (!password) throw new UnauthorizedError("Must provide a password.");

  return userRepository
    .findOneBy({ username })
    .then((user) => comparePassword(user, password))
    .then((user) =>
      jwtTokenForUser(user).then((token) => {
        res.setHeader("X-Doodlebob-Access-Token", token);
        return user;
      }),
    );
});

auth.on(Verb.POST, "/signUp", [], (req, res) => {
  const attrs = deserializeUserCreate(req.body.data);
  return buildUser(attrs)
    .then((user) => userRepository.save(user))
    .then((user) =>
      jwtTokenForUser(user).then((token) => {
        res.setHeader("X-Doodlebob-Access-Token", token);
        return user;
      }),
    );
});

export default auth;
