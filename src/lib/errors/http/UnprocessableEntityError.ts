import { HttpError } from "../HttpError";
import { HttpStatus } from "../HttpStatus";

export class UnprocessableEntityError extends HttpError {
  constructor(message = "An error occurred.") {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message);
  }
}
