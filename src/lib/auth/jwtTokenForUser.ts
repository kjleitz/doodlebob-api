import User from "../../orm/entities/User";
import jwtClaimsForUser from "./jwtClaimsForUser";
import jwtTokenForClaims from "./jwtTokenForClaims";

export default function jwtTokenForUser(user: User): Promise<string> {
  const claims = jwtClaimsForUser(user);
  return jwtTokenForClaims(claims);
}
