import HttpError from "../HttpError";
import HttpStatus from "../HttpStatus";

export default class InternalServerError extends HttpError {
  constructor(message = InternalServerError.DEFAULT_MESSAGE, original?: any) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message, original);
  }
}
