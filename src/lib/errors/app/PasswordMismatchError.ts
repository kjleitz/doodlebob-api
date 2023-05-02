import { BaseError } from "../BaseError";

export class PasswordMismatchError extends BaseError {
  constructor(message = "Username and/or password is incorrect") {
    super(message);
  }
}
