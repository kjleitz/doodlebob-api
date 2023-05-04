import { comparePassword } from "../../lib/users/auth";
import { CreateUserData, UpdateUserData, buildUser, editUser } from "../../lib/users/userData";
import appDataSource from "../../orm/config/appDataSource";
import User from "../../orm/entities/User";
import Controller, { Verb } from "../Controller";

const users = new Controller();
const userRepository = appDataSource.getRepository(User);

users.on(Verb.GET, "/", [], () => {
  return userRepository.find();
});

users.on(Verb.GET, "/:id", [], (req) => {
  const { id } = req.params;
  return userRepository.findOneByOrFail({ id });
});

users.on(Verb.POST, "/", [], (req) => {
  const { username, email, password } = req.body as CreateUserData;
  return buildUser({ username, email, password }).then((user) => userRepository.save(user));
});

users.on([Verb.PATCH, Verb.PUT], "/:id", [], (req) => {
  const { id } = req.params;
  const { username, email, newPassword, oldPassword } = req.body as UpdateUserData;

  return userRepository.findOneByOrFail({ id }).then((user) => {
    if (!newPassword) return userRepository.update(id, { username, email });

    return comparePassword(user, oldPassword)
      .then(() => editUser({ username, email, newPassword, oldPassword }))
      .then((updatedAttrs) => userRepository.update(id, updatedAttrs));
  });
});

users.on(Verb.DELETE, "/", [], (req) => {
  const { id } = req.params;
  return userRepository.findOneByOrFail({ id }).then((user) => userRepository.remove(user));
});

export default users;
