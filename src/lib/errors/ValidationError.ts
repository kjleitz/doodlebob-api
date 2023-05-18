import { JapiError } from "ts-japi";
import { ZodIssue } from "zod";
import Config from "../../Config";
import { findLast } from "../utils/arrays";
import HttpStatus, { titleForStatus } from "./HttpStatus";

export default class ValidationError extends JapiError {
  static DEFAULT_MESSAGE = "Unable to process input.";

  field: string | null;
  path: (string | number)[];
  message: string;

  constructor(issue: ZodIssue) {
    const statusCode = HttpStatus.UNPROCESSABLE_ENTITY;

    super({
      status: `${statusCode}`,
      code: issue.code,
      title: titleForStatus(statusCode),
      detail: issue.message,
    });

    this.message = issue.message;
    this.path = issue.path;
    this.field = this.fieldFromPath(issue.path);

    if (!Config.isProd) {
      this.meta = { original: issue };
    }
  }

  private fieldFromPath(path: (string | number)[]): string | null {
    return (findLast(path, (item) => !!item && typeof item === "string") as string) ?? null;
  }
}
