import { ErrorSerializer } from "ts-japi";
import HttpError from "../errors/HttpError";

const HttpErrorSerializer = new ErrorSerializer<HttpError>();

export default HttpErrorSerializer;
