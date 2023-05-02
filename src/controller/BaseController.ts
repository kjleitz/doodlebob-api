import { NextFunction, Request, Response } from "express";
import { MissingActionError } from "../lib/errors/app/MissingActionError";

export interface ControllerAction<R = unknown> {
  (request: Request, response: Response, next: NextFunction): Promise<R>;
}

export class BaseController {
  index(request: Request, response: Response, next: NextFunction): Promise<unknown[]> {
    throw new MissingActionError("index");
  }

  show(request: Request, response: Response, next: NextFunction): Promise<unknown> {
    throw new MissingActionError("show");
  }

  create(request: Request, response: Response, next: NextFunction): Promise<unknown> {
    throw new MissingActionError("create");
  }

  update(request: Request, response: Response, next: NextFunction): Promise<unknown> {
    throw new MissingActionError("update");
  }

  destroy(request: Request, response: Response, next: NextFunction): Promise<unknown> {
    throw new MissingActionError("destroy");
  }

  // protected notFoundFilter<R>(resource: R): R {
  //   if (resource == null || typeof resource == "undefined") {
  //     throw new NotFoundError(resourceName, id);
  //   }
  //
  //   return resource;
  // }
}
