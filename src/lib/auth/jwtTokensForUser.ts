import User from "../../orm/entities/User";
import jwtAccessTokenForUser from "./jwtAccessTokenForUser";
import jwtRefreshTokenForUser from "./jwtRefreshTokenForUser";

export default function jwtTokensForUser(user: User): Promise<[refreshToken: string, accessToken: string, user: User]> {
  return Promise.all([jwtRefreshTokenForUser(user), jwtAccessTokenForUser(user), user]);
}
