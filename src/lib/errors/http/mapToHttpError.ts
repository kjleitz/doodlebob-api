import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  FindRelationsNotFoundError,
  PersistedEntityNotFoundError,
  QueryFailedError,
} from "typeorm";
import HttpError from "../HttpError";
import MissingActionError from "../app/MissingActionError";
import PasswordMismatchError from "../app/PasswordMismatchError";
import InternalServerError from "./InternalServerError";
import NotFoundError from "./NotFoundError";
import UnauthorizedError from "./UnauthorizedError";
import UnprocessableEntityError from "./UnprocessableEntityError";
import Config from "../../../Config";
import UnknownJwtError from "../app/UnknownJwtError";
import EmptyJwtError from "../app/EmptyJwtError";
import { capitalize } from "../../utils/strings";

const mapToHttpError = (error: any): HttpError => {
  // Nullish/empty error:
  if (!error) return new InternalServerError(InternalServerError.DEFAULT_MESSAGE);

  // HTTP errors (shortcut):
  if (error instanceof HttpError) return error;

  // App errors:
  if (error instanceof MissingActionError) return new NotFoundError("Action", error.actionName, error);
  if (error instanceof PasswordMismatchError) return new UnauthorizedError(error.message, error);
  if (error instanceof UnknownJwtError) return new UnauthorizedError(error.message, error);
  if (error instanceof EmptyJwtError) return new UnauthorizedError(error.message, error);

  // TypeORM errors:
  if (error instanceof EntityNotFoundError) return new NotFoundError("Entity", undefined, error);
  if (error instanceof FindRelationsNotFoundError) return new NotFoundError("Relation", undefined, error);
  if (error instanceof PersistedEntityNotFoundError) return new NotFoundError("Entity", undefined, error);
  if (error instanceof CannotCreateEntityIdMapError)
    return new UnprocessableEntityError(UnprocessableEntityError.DEFAULT_MESSAGE, error);

  if (error instanceof QueryFailedError && error.message.includes("violates unique constraint")) {
    const keyMatches = (error.driverError.detail as string).match(/Key \(([^)]+)\)=\(([^)]+)\) already exists/);
    if (!keyMatches) return new UnprocessableEntityError(UnprocessableEntityError.DEFAULT_MESSAGE, error);

    const [_match, key, value] = keyMatches;
    const message = keyMatches
      ? `${capitalize(key)} ${JSON.stringify(value)} already exists.`
      : UnprocessableEntityError.DEFAULT_MESSAGE;

    return new UnprocessableEntityError(message);
  }

  // Default/fallback errors:
  return Config.isProd
    ? new InternalServerError(InternalServerError.DEFAULT_MESSAGE, error)
    : new InternalServerError(error.message || error.detail || InternalServerError.DEFAULT_MESSAGE, error);
};

export default mapToHttpError;
