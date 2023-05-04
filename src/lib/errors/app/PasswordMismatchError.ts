import AppError from "../AppError";

export default class PasswordMismatchError extends AppError {
  constructor(message = "Username and/or password is incorrect") {
    super(message);
  }
}
