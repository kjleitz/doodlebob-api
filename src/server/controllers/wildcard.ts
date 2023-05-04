import NotFoundError from "../../lib/errors/http/NotFoundError";
import Controller, { Verb } from "../Controller";

const wildcard = new Controller();

wildcard.on(Verb.ALL, "*", [], () => {
  throw new NotFoundError("Route");
});

export default wildcard;
