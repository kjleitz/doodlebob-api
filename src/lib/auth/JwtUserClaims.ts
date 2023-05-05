import Role from "./Role";

export default interface JwtUserClaims {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string; // Date serialized with JSON.stringify()
  updatedAt: string; // Date serialized with JSON.stringify()
}
