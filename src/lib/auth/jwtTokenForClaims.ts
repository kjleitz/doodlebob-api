import jwt, { SignOptions } from "jsonwebtoken";
import Config from "../../Config";
import UnknownJwtError from "../errors/app/UnknownJwtError";

export default function jwtTokenForClaims(claims: Record<string, any>): Promise<string> {
  const jwtOptions: SignOptions = {
    expiresIn: Config.jwtExp,
    issuer: `doodlebob-${Config.env}`,
    algorithm: "HS256",
  };

  return new Promise((resolve, reject) => {
    jwt.sign(claims, Config.jwtSecret, jwtOptions, (error, token) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      } else {
        reject(new UnknownJwtError("I don't know what happened. This shouldn't happen."));
      }
    });
  });
}
