import { BaseError } from "../BaseError";

export class MissingActionError extends BaseError {
  constructor(actionName: string) {
    super(`No controller action '${actionName}'.`);
  }
}
