import { HttpError } from "../HttpError";
import { HttpStatus } from "../HttpStatus";

export class UnauthorizedError extends HttpError {
  static DEFAULT_MESSAGE = "Authentication failed.";

  constructor(message = UnauthorizedError.DEFAULT_MESSAGE, original?: any) {
    super(HttpStatus.UNAUTHORIZED, message, original);
  }
}
