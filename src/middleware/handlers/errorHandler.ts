import { ErrorRequestHandler } from "express";
import { HttpError } from "../../lib/errors/HttpError";
import { Config } from "../../Config";
import { mapToHttpError } from "../../lib/errors/http/mapToHttpError";

// TODO: JSON:API spec in full
const responseForError = (httpError: HttpError, original?: Error): Record<string, any> => {
  const errorObject: Record<string, any> = {
    status: `${httpError.statusCode}`,
    title: httpError.name,
    detail: httpError.message,
  };

  if (Config.isDev) {
    errorObject.meta = {
      stack: httpError.stack,
      original: original && {
        name: original.name,
        message: original.message,
        stack: original.stack,
      },
    };
  }

  return { errors: [errorObject] };
};

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  const httpError = mapToHttpError(error);
  const responseJson = responseForError(httpError, error);
  return response.status(httpError.statusCode).json(responseJson);
};
