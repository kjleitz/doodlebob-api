import AppError from "../AppError";

export default class UnknownJwtError extends AppError {
  constructor(message = "Unknown error while signing JWT.") {
    super(message);
  }
}
