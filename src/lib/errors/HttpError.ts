import { BaseError } from "./BaseError";
import { HttpStatus } from "./HttpStatus";

export class HttpError extends BaseError {
  statusCode: HttpStatus;

  constructor(statusCode: HttpStatus, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
