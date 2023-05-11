import AppError from "../AppError";

export default class InvalidInputError extends AppError {
  field: string;

  constructor(field: string, message?: string) {
    super(message ?? `Field "${field}" is invalid.`);
    this.field = field;
  }
}
