import { HttpError } from "./HttpError";

export class NotFoundError extends HttpError {
  constructor(resourceName: string, id?: number | string) {
    const message = `${resourceName}${id ? ' ' + id : ''} not found.`;
    super(404, message);
  }
}
