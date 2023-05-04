import { ErrorSerializer } from "ts-japi";
import { HttpError } from "../errors/HttpError";

export const HttpErrorSerializer = new ErrorSerializer<HttpError>();
