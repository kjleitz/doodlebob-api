import AppError from "../AppError";

export default class UnrecognizedEntityError extends AppError {
  constructor(entity: any) {
    super(`Unknown entity: ${JSON.stringify(entity)}`);
  }
}
