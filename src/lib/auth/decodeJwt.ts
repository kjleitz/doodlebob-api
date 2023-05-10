import jwt, { JwtPayload } from "jsonwebtoken";
import EmptyJwtError from "../errors/app/EmptyJwtError";
import Config from "../../Config";
import UnknownJwtError from "../errors/app/UnknownJwtError";

export default function decodeJwt<T extends JwtPayload>(token: string): Promise<T> {
  if (!token) return Promise.reject(new EmptyJwtError());

  return new Promise<T>((resolve, reject) => {
    jwt.verify(token, Config.jwtSecret, (error, payload) => {
      if (error) {
        reject(error);
      } else if (typeof payload === "string") {
        reject(new UnknownJwtError("JWT payload is a string."));
      } else if (payload) {
        resolve(payload as T);
      } else {
        reject(new UnknownJwtError("This, surely, should NOT have happened."));
      }
    });
  });
}
