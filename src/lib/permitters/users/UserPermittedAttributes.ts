import User from "../../../orm/entities/User";

type UserPermittedAttributes = Partial<Pick<User, "username" | "email">>;

export default UserPermittedAttributes;
