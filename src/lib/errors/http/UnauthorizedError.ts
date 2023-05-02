import { HttpError } from "../HttpError";
import { HttpStatus } from "../HttpStatus";

export class UnauthorizedError extends HttpError {
  constructor(message = "Authentication failed.") {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}
