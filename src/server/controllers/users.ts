import Role from "../../lib/auth/Role";
import buildUser from "../../lib/builders/users/buildUser";
import buildUserAdmin from "../../lib/builders/users/buildUserAdmin";
import editUser from "../../lib/builders/users/editUser";
import editUserAdmin from "../../lib/builders/users/editUserAdmin";
import HttpStatus from "../../lib/errors/HttpStatus";
import { middleman } from "../../lib/utils/promises";
import appDataSource from "../../orm/config/appDataSource";
import User from "../../orm/entities/User";
import Controller, { Verb } from "../Controller";
import adminGate from "../middleware/gates/adminGate";
import authGate from "../middleware/gates/authGate";
import ownGate from "../middleware/gates/ownGate";
import {
  UserAdminCreateResourceDocument,
  UserAdminUpdateResourceDocument,
  UserCreateResourceDocument,
  UserUpdateResourceDocument,
} from "../schemata/jsonApiUsers";

const users = new Controller();
const userRepository = appDataSource.getRepository(User);

users.on(Verb.GET, "/", [authGate, adminGate], () => {
  // TODO: pagination
  return userRepository.find();
});

users.on(Verb.GET, "/:id", [authGate, ownGate], (req) => {
  const { id } = req.params;
  return userRepository.findOneByOrFail({ id });
});

users.on(Verb.POST, "/", [authGate, adminGate], (req, res) => {
  let builder: Promise<User>;

  // This action is admin-gated, so this is unnecessary. However, we'll double-
  // check here, just to be safe, in case that gate is removed in the future
  // without a corresponding change to the logic.
  if (req.jwtUserClaims?.role === Role.ADMIN) {
    const document = UserAdminCreateResourceDocument.parse(req.body);
    builder = buildUserAdmin(document.data.attributes);
  } else {
    const document = UserCreateResourceDocument.parse(req.body);
    builder = buildUser(document.data.attributes);
  }

  return builder.then((user) => userRepository.save(user)).then(middleman(() => res.status(HttpStatus.CREATED)));
});

users.on([Verb.PATCH, Verb.PUT], "/:id", [authGate, ownGate], (req) => {
  const { id } = req.params;
  return userRepository
    .findOneByOrFail({ id })
    .then((user) => {
      if (req.jwtUserClaims?.role === Role.ADMIN) {
        const document = UserAdminUpdateResourceDocument.parse(req.body);
        return editUserAdmin(user, document.data.attributes);
      }

      const document = UserUpdateResourceDocument.parse(req.body);
      return editUser(user, document.data.attributes);
    })
    .then((edits) => userRepository.save(edits));
});

users.on(Verb.DELETE, "/:id", [authGate, ownGate], (req) => {
  const { id } = req.params;
  return userRepository.findOneByOrFail({ id }).then((user) => userRepository.remove(user));
});

export default users;
