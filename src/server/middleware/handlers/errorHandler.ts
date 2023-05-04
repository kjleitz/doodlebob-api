import { ErrorRequestHandler } from "express";
import { mapToHttpError } from "../../../lib/errors/http/mapToHttpError";
import { HttpErrorSerializer } from "../../../lib/serializers/HttpErrorSerializer";

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  const httpError = mapToHttpError(error);
  const responseJson = HttpErrorSerializer.serialize(httpError);
  return response.status(httpError.statusCode).json(responseJson);
};
