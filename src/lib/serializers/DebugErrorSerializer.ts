import { ErrorSerializer, JapiError } from "ts-japi";
import AppError from "../errors/AppError";

const DebugErrorSerializer = new ErrorSerializer<Error | JapiError | AppError>({
  attributes: {
    detail: "stack",
  },
});

export default DebugErrorSerializer;
