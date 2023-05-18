import { ErrorRequestHandler } from "express";
import { ErrorDocument } from "ts-japi";
import { ZodError, ZodIssue } from "zod";
import HttpStatus from "../../../lib/errors/HttpStatus";
import ValidationError from "../../../lib/errors/ValidationError";
import mapToHttpError from "../../../lib/errors/http/mapToHttpError";
import HttpErrorSerializer from "../../../lib/serializers/HttpErrorSerializer";
import ValidationErrorSerializer from "../../../lib/serializers/ValidationErrorSerializer";

const validationErrorsFromZodError = (error: ZodError): ValidationError[] => {
  let validationErrors: ValidationError[] = [];

  error.issues.forEach((issue: ZodIssue) => {
    if (issue.code === "invalid_union") {
      issue.unionErrors.forEach((subError) => {
        subError.issues.forEach((subIssue) => {
          validationErrors.push(new ValidationError(subIssue));
        });
      });
    } else if (issue.code === "invalid_arguments") {
      issue.argumentsError.issues.forEach((subIssue) => {
        validationErrors.push(new ValidationError(subIssue));
      });
    } else if (issue.code === "invalid_return_type") {
      issue.returnTypeError.issues.forEach((subIssue) => {
        validationErrors.push(new ValidationError(subIssue));
      });
    } else {
      validationErrors.push(new ValidationError(issue));
    }
  });

  return validationErrors;
};

const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  let responseJson: ErrorDocument;
  let statusCode: HttpStatus;

  // Special case because ZodErrors are validation errors and potentially report
  // multiple different field validation issues at once. This can be valuable
  // information on the front end (e.g., when submitting form data). When
  // serializing errors according to the JSON:API spec, the top-level field
  // named `errors` always points to a collection. That collection is usually
  // single-membered, but in this case it's a useful way to present multiple
  // different issues in the serialized error document.

  if (error instanceof ZodError) {
    statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    const errors = validationErrorsFromZodError(error);
    responseJson = ValidationErrorSerializer.serialize(errors);
  } else {
    const httpError = mapToHttpError(error);
    statusCode = httpError.statusCode;
    responseJson = HttpErrorSerializer.serialize(httpError);
  }

  return response.status(statusCode).json(responseJson);
};

export default errorHandler;
