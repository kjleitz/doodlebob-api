import UserAdminPermittedAttributes from "./UserAdminPermittedAttributes";

type UserAdminCreateAttributes = UserAdminPermittedAttributes & { password?: string };

export default UserAdminCreateAttributes;
