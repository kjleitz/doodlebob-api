import { JapiError } from "ts-japi";
import { HttpStatus, titleForStatus } from "./HttpStatus";
import { Config } from "../../Config";
import { DebugErrorSerializer } from "../serializers/DebugErrorSerializer";
import { BaseError } from "./BaseError";

export class HttpError extends JapiError {
  static DEFAULT_MESSAGE = "An error occurred.";

  readonly statusCode: HttpStatus;
  message: string;

  constructor(statusCode: HttpStatus, detail: string, original?: any) {
    super({
      status: `${statusCode}`,
      code: HttpStatus[statusCode],
      title: titleForStatus(statusCode),
      detail,
    });

    this.statusCode = statusCode;
    this.message = detail;

    if (original && !Config.isProd) {
      if (original instanceof Error || original instanceof JapiError || original instanceof BaseError) {
        this.meta = { original: DebugErrorSerializer.serialize(original) };
      } else {
        this.meta = { original };
      }
    }
  }
}
