import { ErrorSerializer } from "ts-japi";
import ValidationError from "../errors/ValidationError";

const ValidationErrorSerializer = new ErrorSerializer<ValidationError>();

export default ValidationErrorSerializer;
