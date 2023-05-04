import AppError from "../AppError";

export default class MissingActionError extends AppError {
  actionName: string;

  constructor(actionName: string) {
    super(`No controller action '${actionName}'.`);
    this.actionName = actionName;
  }
}
