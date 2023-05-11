import appDataSource from "../../orm/config/appDataSource";
import User from "../../orm/entities/User";
import Controller, { Verb } from "../Controller";
import adminGate from "../middleware/gates/adminGate";
import authGate from "../middleware/gates/authGate";
import ownGate from "../middleware/gates/ownGate";
import deserializeUserAdminCreate from "../../lib/deserializers/users/deserializeUserAdminCreate";
import buildUser from "../../lib/builders/users/buildUser";
import deserializeUserUpdate from "../../lib/deserializers/users/deserializeUserUpdate";
import editUser from "../../lib/builders/users/editUser";
import Role, { ROLES } from "../../lib/auth/Role";
import editUserAdmin from "../../lib/builders/users/editUserAdmin";
import deserializeUserAdminUpdate from "../../lib/deserializers/users/deserializeUserAdminUpdate";
import deserializeUserCreate from "../../lib/deserializers/users/deserializeUserCreate";
import UnprocessableEntityError from "../../lib/errors/http/UnprocessableEntityError";
import Resource from "ts-japi/lib/models/resource.model";
import UserAdminCreateAttributes from "../../lib/permitters/users/UserAdminCreateAttributes";
import UserAdminUpdateAttributes from "../../lib/permitters/users/UserAdminUpdateAttributes";
import buildUserAdmin from "../../lib/builders/users/buildUserAdmin";
import HttpStatus from "../../lib/errors/HttpStatus";
import { validateUserCreateData } from "../../lib/validators/validateUserCreateData";
import { validateUserUpdateData } from "../../lib/validators/validateUserUpdateData";

const users = new Controller();
const userRepository = appDataSource.getRepository(User);

users.on(Verb.GET, "/", [authGate], () => {
  return userRepository.find();
});

users.on(Verb.GET, "/:id", [authGate, ownGate], (req) => {
  const { id } = req.params;
  return userRepository.findOneByOrFail({ id });
});

users.on(Verb.POST, "/", [authGate, adminGate], (req, res) => {
  const data = req.body.data as Resource<UserAdminCreateAttributes>;
  if (!data || !data.attributes) throw new UnprocessableEntityError();

  validateUserCreateData(data.attributes);

  // This action is admin-gated, so this is unnecessary. However, we'll double-
  // check here, just to be safe, in case that gate is removed in the future
  // without a corresponding change to the logic.
  const asAdmin = req.jwtUserClaims?.role === Role.ADMIN;
  const attrs = asAdmin ? deserializeUserAdminCreate(data) : deserializeUserCreate(data);

  return (asAdmin ? buildUserAdmin(attrs) : buildUser(attrs))
    .then((user) => userRepository.save(user))
    .then((user) => {
      res.status(HttpStatus.CREATED);
      return user;
    });
});

users.on([Verb.PATCH, Verb.PUT], "/:id", [authGate, ownGate], (req) => {
  const { id } = req.params;
  const data = req.body.data as Resource<UserAdminUpdateAttributes>;
  if (!data || !data.attributes) throw new UnprocessableEntityError();

  validateUserUpdateData(data.attributes);

  const asAdmin = req.jwtUserClaims?.role === Role.ADMIN;
  const attrs = asAdmin ? deserializeUserAdminUpdate(data) : deserializeUserUpdate(data);

  return userRepository
    .findOneByOrFail({ id })
    .then((user) => (asAdmin ? editUserAdmin(user, attrs) : editUser(user, attrs)))
    .then((edits) => userRepository.save(edits));
});

users.on(Verb.DELETE, "/:id", [authGate, ownGate], (req) => {
  const { id } = req.params;
  return userRepository.findOneByOrFail({ id }).then((user) => userRepository.remove(user));
});

export default users;
