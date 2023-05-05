import { DataDocument, ErrorDocument } from "ts-japi";
import JwtUserClaims from "./lib/auth/JwtUserClaims";

declare global {
  namespace Express {
    // export interface Request<E extends Record<string, any> = Record<string, any>> {
    //   jwtUserClaims?: JwtUserClaims;
    //   body: DataDocument<E> | ErrorDocument;
    // }
    export interface Request {
      jwtUserClaims?: JwtUserClaims;
      body: DataDocument | ErrorDocument;
    }
  }
}
