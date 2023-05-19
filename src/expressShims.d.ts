import * as tsJapi from "ts-japi";
import JwtUserClaims from "./lib/auth/JwtUserClaims";
import PageOptions from "./lib/pagination/PageOptions";
import * as http from "http";

declare global {
  namespace Express {
    export interface Request {
      jwtUserClaims?: JwtUserClaims;
      document: tsJapi.DataDocument<any> | tsJapi.ErrorDocument | null;
      page: PageOptions;
    }
  }
}
