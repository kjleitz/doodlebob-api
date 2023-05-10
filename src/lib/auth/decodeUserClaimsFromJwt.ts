import { omit } from "../utils/objects";
import JwtUserClaims from "./JwtUserClaims";
import decodeJwt from "./decodeJwt";

export default function decodeUserClaimsFromJwt(token: string): Promise<JwtUserClaims> {
  return decodeJwt(token).then((payload) => omit(payload, "iss", "iat", "exp", "alg") as JwtUserClaims);
}
