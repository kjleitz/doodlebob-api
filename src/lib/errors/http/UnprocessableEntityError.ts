import { HttpError } from "../HttpError";
import { HttpStatus } from "../HttpStatus";

export class UnprocessableEntityError extends HttpError {
  constructor(message = UnprocessableEntityError.DEFAULT_MESSAGE, original?: any) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message, original);
  }
}
