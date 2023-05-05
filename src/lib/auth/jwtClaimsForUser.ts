import User from "../../orm/entities/User";
import JwtUserClaims from "./JwtUserClaims";

const jwtClaimsForUser = (user: User): JwtUserClaims => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  createdAt: JSON.stringify(user.createdAt),
  updatedAt: JSON.stringify(user.updatedAt),
});

export default jwtClaimsForUser;
