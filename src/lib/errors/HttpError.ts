import { BaseError } from "./BaseError";
import { HttpStatus, titleForStatus } from "./HttpStatus";

export class HttpError extends BaseError {
  statusCode: HttpStatus;
  title: string;

  constructor(statusCode: HttpStatus, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.title = titleForStatus(this.statusCode);
  }
}
