import { BaseError } from "../BaseError";

export class MissingActionError extends BaseError {
  actionName: string;

  constructor(actionName: string) {
    super(`No controller action '${actionName}'.`);
    this.actionName = actionName;
  }
}
