import ForbiddenError from "../../../lib/errors/http/ForbiddenError";
import Role from "../../../lib/auth/Role";
import Gate from "./Gate";

const adminGate: Gate = (req, res, next) => {
  if (req.jwtUserClaims?.role === Role.ADMIN) {
    next();
  } else {
    next(new ForbiddenError());
  }
};

export default adminGate;
