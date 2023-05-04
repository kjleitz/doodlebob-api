import { appDataSource } from "../../orm/config/appDataSource";
import { NextFunction, Request, Response } from "express";
import { User } from "../../orm/entities/User";
import { BaseController } from "./BaseController";
import { CreateUserData, UpdateUserData, buildUser, editUser } from "../../lib/users/userData";
import { comparePassword } from "../../lib/users/auth";

// TODO: validators
export class UsersController extends BaseController {
  private userRepository = appDataSource.getRepository(User);

  index(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.find();
  }

  show(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    return this.userRepository.findOneByOrFail({ id });
  }

  create(request: Request, response: Response, next: NextFunction) {
    const { username, email, password } = request.body as CreateUserData;
    return buildUser({ username, email, password }).then((user) => this.userRepository.save(user));
  }

  update(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;
    const { username, email, newPassword, oldPassword } = request.body as UpdateUserData;

    return this.userRepository.findOneByOrFail({ id }).then((user) => {
      if (!newPassword) return this.userRepository.update(id, { username, email });

      return comparePassword(user, oldPassword)
        .then(() => editUser({ username, email, newPassword, oldPassword }))
        .then((updatedAttrs) => this.userRepository.update(id, updatedAttrs));
    });
  }

  destroy(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;
    return this.userRepository.findOneByOrFail({ id }).then((user) => this.userRepository.remove(user));
  }
}
