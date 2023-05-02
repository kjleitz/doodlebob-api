import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  FindRelationsNotFoundError,
  PersistedEntityNotFoundError,
} from "typeorm";
import { HttpError } from "../HttpError";
import { MissingActionError } from "../app/MissingActionError";
import { PasswordMismatchError } from "../app/PasswordMismatchError";
import { InternalServerError } from "./InternalServerError";
import { NotFoundError } from "./NotFoundError";
import { UnauthorizedError } from "./UnauthorizedError";
import { UnprocessableEntityError } from "./UnprocessableEntityError";
import { Config } from "../../../Config";

export const mapToHttpError = (error: any): HttpError => {
  // Null/empty error:
  if (!error) return new InternalServerError();

  // HTTP errors (shortcut):
  if (error instanceof HttpError) return error;

  // App errors:
  if (error instanceof MissingActionError) return new NotFoundError("Action");
  if (error instanceof PasswordMismatchError) return new UnauthorizedError();

  // TypeORM errors:
  if (error instanceof EntityNotFoundError) return new NotFoundError("Entity");
  if (error instanceof FindRelationsNotFoundError) return new NotFoundError("Relation");
  if (error instanceof PersistedEntityNotFoundError) return new NotFoundError("Entity");
  if (error instanceof CannotCreateEntityIdMapError) return new UnprocessableEntityError();

  // Default/fallback errors:
  return Config.isDev ? new InternalServerError("message" in error ? error.message : error) : new InternalServerError();
};
