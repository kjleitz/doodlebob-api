import UnauthorizedError from "../../../lib/errors/http/UnauthorizedError";
import Gate from "./Gate";

const authGate: Gate = (req, res, next) => {
  if (req.jwtUserClaims) {
    next();
  } else {
    next(new UnauthorizedError("Authentication required."));
  }
};

export default authGate;
