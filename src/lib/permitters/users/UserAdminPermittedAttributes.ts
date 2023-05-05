import User from "../../../orm/entities/User";

type UserAdminPermittedAttributes = Partial<Pick<User, "username" | "email" | "role">>;

export default UserAdminPermittedAttributes;
