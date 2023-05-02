import { HttpError } from "../HttpError";
import { HttpStatus } from "../HttpStatus";

export class InternalServerError extends HttpError {
  constructor(message = "An error occurred.") {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
