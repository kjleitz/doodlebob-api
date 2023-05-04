import { ErrorSerializer, JapiError } from "ts-japi";
import { BaseError } from "../errors/BaseError";

export const DebugErrorSerializer = new ErrorSerializer<Error | JapiError | BaseError>({
  attributes: {
    detail: "stack",
  },
});
