import { omit } from "../utils/objects";
import JwtRefreshClaims from "./JwtRefreshClaims";
import decodeJwt from "./decodeJwt";

export default function decodeRefreshClaimsFromJwt(token: string): Promise<JwtRefreshClaims> {
  return decodeJwt(token).then((payload) => omit(payload, "iss", "iat", "exp", "alg") as JwtRefreshClaims);
}
