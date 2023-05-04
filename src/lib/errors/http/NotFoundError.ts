import HttpError from "../HttpError";
import HttpStatus from "../HttpStatus";

export default class NotFoundError extends HttpError {
  constructor(resourceName: string, id?: number | string, original?: any) {
    const message = `${resourceName}${id ? " " + id : ""} not found.`;
    super(HttpStatus.NOT_FOUND, message, original);
  }
}
