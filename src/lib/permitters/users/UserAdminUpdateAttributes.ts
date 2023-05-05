import UserAdminPermittedAttributes from "./UserAdminPermittedAttributes";

type UserAdminUpdateAttributes = UserAdminPermittedAttributes & { oldPassword?: string; newPassword?: string };

export default UserAdminUpdateAttributes;
