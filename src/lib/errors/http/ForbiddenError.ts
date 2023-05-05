import HttpError from "../HttpError";
import HttpStatus from "../HttpStatus";

export default class ForbiddenError extends HttpError {
  static DEFAULT_MESSAGE = "Access to this resource is forbidden";

  constructor(message = ForbiddenError.DEFAULT_MESSAGE, original?: any) {
    super(HttpStatus.FORBIDDEN, message, original);
  }
}
