import UserPermittedAttributes from "./UserPermittedAttributes";

type UserCreateAttributes = UserPermittedAttributes & { password?: string };

export default UserCreateAttributes;
