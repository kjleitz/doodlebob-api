import Config from "../../Config";
import User from "../../orm/entities/User";
import jwtTokenForClaims from "./jwtTokenForClaims";

export default function jwtRefreshTokenForUser({ id }: Pick<User, "id">): Promise<string> {
  return jwtTokenForClaims({ id }, Config.jwtRefreshExp);
}
