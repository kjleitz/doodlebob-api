import bcrypt from "bcrypt";
import User from "../../orm/entities/User";
import PasswordMismatchError from "../errors/app/PasswordMismatchError";
import { Nullish } from "../utils/types";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Resolves to the user if password is correct, catches if incorrect.
export function comparePassword(user: User | Nullish, password: string): Promise<User> {
  if (!user) return Promise.reject(new PasswordMismatchError());

  return bcrypt.compare(password, user.passwordHash || "").then((confirmed) => {
    if (!confirmed) throw new PasswordMismatchError();

    return user;
  });
}

export function setPassword(user: User, password: string): Promise<User> {
  return hashPassword(password).then((hash) => {
    user.passwordHash = hash;
    return user;
  });
}

export function setPasswordSync(user: User, password: string): User {
  user.passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  return user;
}
