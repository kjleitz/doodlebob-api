import Config from "../../Config";
import User from "../../orm/entities/User";
import jwtClaimsForUser from "./jwtClaimsForUser";
import jwtTokenForClaims from "./jwtTokenForClaims";

export default function jwtAccessTokenForUser(user: User): Promise<string> {
  const claims = jwtClaimsForUser(user);
  return jwtTokenForClaims(claims, Config.jwtExp);
}
