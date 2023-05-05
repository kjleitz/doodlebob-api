import { NextFunction, Request, Response } from "express";
import Gate from "./Gate";
import ForbiddenError from "../../../lib/errors/http/ForbiddenError";
import Role from "../../../lib/auth/Role";

export type RequestStore = "params" | "body" | "query";

export default function ownGate(): Gate;
export default function ownGate(req: Request, res: Response, next: NextFunction): void;
export default function ownGate(idParam: string, allowAdmin?: boolean): Gate;
export default function ownGate(getId: (req: Request) => string, allowAdmin?: boolean): Gate;
export default function ownGate(
  idGetter?: string | ((req: Request) => string) | Request,
  allowAdmin: boolean | Response = true,
  next?: NextFunction,
): Gate | void {
  // If we were included in the request handlers as simply `ownGate` (uncalled),
  // then it will be called directly as a handler. So, if it's called with the
  // usual `(req, res, next)` args, we should get the default gate it returns
  // when given no arguments, and then call that gate immediately with the given
  // request, response, and next function:
  if (idGetter && allowAdmin && typeof next === "function")
    return ownGate()(idGetter as Request, allowAdmin as Response, next!);

  // Otherwise, we should return a handler function that can be called later.
  return (req, res, next) => {
    const { jwtUserClaims } = req;

    // If the user is not authenticated, then we cannot know if they own this
    // resource. Therefore, they are forbidden from accessing it:
    if (!jwtUserClaims) return next(new ForbiddenError());

    // If `allowAdmin` is true, we'll let this action happen as long as the
    // authenticated user has the `ADMIN` role:
    if (allowAdmin && jwtUserClaims.role === Role.ADMIN) return next();

    // If we were included in the request handlers as `ownGate()` (no args),
    // then we'll assume the user ID is contained in the route parameters under
    // the "id" key:
    idGetter ??= "id";

    // If we were included in the request handlers as, e.g.,  `ownGate("uuid")`
    // or `ownGate(req => req.body.data.id)` (with param key arg or getter arg),
    // then we should use the specified strategy for getting the user ID:
    const id = typeof idGetter === "function" ? idGetter(req) : req.params[idGetter as string];

    // If the ID was able to be computed and it matches the authenticated user's
    // ID, then we're good:
    if (id && jwtUserClaims.id === id) return next();

    // Otherwise, the authenticated user does not own this resource:
    next(new ForbiddenError());
  };
}
