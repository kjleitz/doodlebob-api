import { NextFunction, Request, Response } from "express";
import jwtTokenForClaims from "../../../lib/auth/jwtTokenForClaims";
import decodeUserClaimsFromJwt from "../../../lib/auth/decodeUserClaimsFromJwt";
import Config from "../../../Config";
import getAccessTokenFromRequest from "../helpers/getAccessTokenFromRequest";
import setAccessTokenOnResponse from "../helpers/setAccessTokenOnResponse";

export default function setJwtUserClaims(req: Request, res: Response, next: NextFunction): void {
  const token = getAccessTokenFromRequest(req);
  if (!token) return next();

  decodeUserClaimsFromJwt(token)
    .then((claims) => {
      req.jwtUserClaims = claims;
      // Include a new access token in every response. Keepin' it fresh, yo.
      return jwtTokenForClaims(claims, Config.jwtExp);
    })
    .then((token) => setAccessTokenOnResponse(res, token))
    .then(() => next())
    .catch((error) => next(error));
}
