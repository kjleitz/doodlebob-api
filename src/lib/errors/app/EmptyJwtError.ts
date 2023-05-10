import AppError from "../AppError";

export default class EmptyJwtError extends AppError {
  constructor(message = "Cannot decode an empty JWT.") {
    super(message);
  }
}
