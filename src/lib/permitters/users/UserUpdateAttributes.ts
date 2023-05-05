import UserPermittedAttributes from "./UserPermittedAttributes";

type UserUpdateAttributes = UserPermittedAttributes & { oldPassword?: string; newPassword?: string };

export default UserUpdateAttributes;
