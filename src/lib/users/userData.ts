import User from "../../orm/entities/User";
import { omit } from "../utils/objects";
import Role from "./Role";
import { hashPassword, setPassword } from "./auth";

export interface UserData {
  readonly id: string;
  username: string;
  email: string;
  role: Role;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  email?: string;
  role?: Role;
  password: string;
}

export interface BaseUpdateUserData {
  username?: string;
  email?: string;
  role?: Role;
  newPassword?: undefined;
  oldPassword?: undefined;
}

export interface ChangePasswordUserData {
  username?: string;
  email?: string;
  role?: Role;
  newPassword: string;
  oldPassword: string;
}

export type UpdateUserData = BaseUpdateUserData | ChangePasswordUserData;

export function userDataFromEntity(userEntity: User): UserData {
  return {
    id: userEntity.id,
    username: userEntity.username,
    email: userEntity.email,
    role: userEntity.role,
    createdAt: userEntity.createdAt,
    updatedAt: userEntity.updatedAt,
  };
}

// Hashing passwords should be done asynchronously, so this can only be used if
// a password is not included in the data.
export function buildUserSync(userData: Omit<CreateUserData, "password"> & { password?: never }): User {
  const user = new User();
  user.username = userData.username;
  if (userData.email) user.email = userData.email;
  user.role = userData.role ?? Role.PEASANT;

  return user;
}

export function buildUser(userData: CreateUserData): Promise<User> {
  const user = buildUserSync(omit(userData, "password"));
  return setPassword(user, userData.password);
}

// Hashing passwords should be done asynchronously, so this can only be used if
// a new password is not being set.
export function editUserSync(userData: BaseUpdateUserData): Partial<User> {
  const user = new User();
  if (userData.username) user.username = userData.username;
  if (userData.email) user.email = userData.email;
  if (typeof userData.role === "number") user.role = userData.role;

  return user;
}

// Validations and authentication should be done before using this method if the
// password or role are to be changed.
export function editUser(userData: UpdateUserData): Promise<Partial<User>> {
  const user = editUserSync(omit(userData, "newPassword", "oldPassword"));
  if (!userData.newPassword) return Promise.resolve(user);

  return hashPassword(userData.newPassword).then((hash) => {
    user.passwordHash = hash;
    return user;
  });
}
