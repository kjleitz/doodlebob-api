import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import Config from "../../../Config";
import UnknownJwtError from "../../../lib/errors/app/UnknownJwtError";
import JwtUserClaims from "../../../lib/auth/JwtUserClaims";
import { omit } from "../../../lib/utils/objects";
import jwtTokenForClaims from "../../../lib/auth/jwtTokenForClaims";

export default function setJwtUserClaims(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.get("Authorization");
  if (!authHeader) return next();

  const token = authHeader.split(" ")[1];
  if (!token) return next();

  new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, Config.jwtSecret, (error, payload) => {
      if (error) {
        reject(error);
      } else if (typeof payload === "string") {
        reject(new UnknownJwtError("JWT payload is a string."));
      } else if (payload) {
        resolve(payload);
      } else {
        reject(new UnknownJwtError("This, surely, should NOT have happened."));
      }
    });
  })
    .then((payload) => {
      const claims = omit(payload, "iss", "iat", "exp", "alg") as JwtUserClaims;
      req.jwtUserClaims = claims;
      return claims;
    })
    // Include a new token in every response. Keepin' it fresh, yo.
    .then((claims) => jwtTokenForClaims(claims))
    .then((token) => {
      res.setHeader("X-Doodlebob-Access-Token", token);
      next();
    })
    .catch((error) => next(error));
}
