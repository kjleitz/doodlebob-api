import { appDataSource } from "../appDataSource";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { BaseController } from "./BaseController";
// import { NotFoundError } from "../errors/NotFoundError";

// TODO: serializers (explicit or handler?)
// TODO: http error handler
export class UserController extends BaseController {
  private userRepository = appDataSource.getRepository(User);

  index(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.find();
  }

  show(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    // return this.userRepository.findOneBy({ id }).then((user) => {
    //   if (!user) throw new NotFoundError("User", id);

    //   return user;
    // });

    return this.userRepository.findOneByOrFail({ id }).then(user => ({ ...user, foo: "bar" }));
  }

  create(request: Request, response: Response, next: NextFunction) {
    const { username } = request.body;
    const user = new User(null, username);

    return this.userRepository.save(user);
  }

  update(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;
    const { username } = request.body;

    return this.userRepository.findOneByOrFail({ id }).then((_user) => {
      return this.userRepository.update(id, { username });
    });
  }

  destroy(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    return this.userRepository.findOneByOrFail({ id }).then((user) => {
      return this.userRepository.remove(user);
    });
  }
}
