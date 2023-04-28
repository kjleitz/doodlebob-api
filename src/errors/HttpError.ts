import { BaseError } from "./BaseError";

export class HttpError extends BaseError {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
