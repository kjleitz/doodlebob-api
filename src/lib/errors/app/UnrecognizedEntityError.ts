import { BaseError } from "../BaseError";

export class UnrecognizedEntityError extends BaseError {
  constructor(entity: any) {
    super(`Unknown entity: ${JSON.stringify(entity)}`);
  }
}
