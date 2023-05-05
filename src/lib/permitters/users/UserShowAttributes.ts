import User from "../../../orm/entities/User";

type UserShowAttributes = Pick<User, "id" | "username" | "email" | "role" | "createdAt" | "updatedAt">;

export default UserShowAttributes;
