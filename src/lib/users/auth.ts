import bcrypt from "bcrypt";
import { User } from "../../orm/entities/User";
import { PasswordMismatchError } from "../errors/app/PasswordMismatchError";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Resolves if password is correct, catches if incorrect.
export function comparePassword(user: User, password: string): Promise<void> {
  return bcrypt.compare(password, user.passwordHash || "").then((confirmed) => {
    if (!confirmed) throw new PasswordMismatchError();
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
