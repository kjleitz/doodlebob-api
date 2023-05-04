import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import { Serializer } from "ts-japi";
import UnrecognizedEntityError from "../lib/errors/app/UnrecognizedEntityError";
import serializeData from "../lib/serializers/serializeData";
import serializeEntities from "../lib/serializers/serializeEntities";
import serializeEntity from "../lib/serializers/serializeEntity";

export enum Verb {
  ALL = "all",
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
  PATCH = "patch",
  OPTIONS = "options",
  HEAD = "head",
}

export type Action<R> = (req: Request, res: Response, next: NextFunction) => R | Promise<R>;

export default class Controller {
  router = Router();

  on<R>(
    verbs: Verb | Verb[],
    path: string | RegExp,
    middlewares: RequestHandler[],
    action: Action<R>,
    shouldSerialize = true,
  ): void {
    if (Array.isArray(verbs)) return verbs.forEach((verb) => this.on(verb, path, middlewares, action));

    this.router[verbs](path, ...middlewares, (req, res, next) => {
      return this.resolveAction(action, req, res, next, shouldSerialize);
    });
  }

  protected resolveAction<R>(
    action: Action<R>,
    req: Request,
    res: Response,
    next: NextFunction,
    shouldSerialize: boolean,
  ): Promise<any> {
    return new Promise((resolve, _reject) => {
      const result = action(req, res, next);
      resolve(result);
    })
      .then((value) => {
        if (!res.headersSent && shouldSerialize)
          return this.serialize(value).then((serialized) => res.json(serialized));
      })
      .catch((e) => next(e));
  }

  protected serialize(value: any): ReturnType<Serializer["serialize"]> {
    if (!value) return Promise.resolve(value);
    if (typeof value.jsonapi === "object") return Promise.resolve(value);

    const entitySerialized = Array.isArray(value) ? serializeEntities(value) : serializeEntity(value);
    return entitySerialized.catch((e) => {
      if (e instanceof UnrecognizedEntityError) return serializeData(value);
      throw e;
    });
  }
}
