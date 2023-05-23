import * as http from "http";
import * as tsJapi from "ts-japi";
import JwtUserClaims from "./lib/auth/JwtUserClaims";
import PageOptions from "./lib/pagination/PageOptions";
import FilterOptions from "./lib/filter/FilterOptions";
import SortOptions from "./lib/sort/SortOptions";

declare global {
  namespace Express {
    export interface Request {
      jwtUserClaims?: JwtUserClaims;
      document: tsJapi.DataDocument<any> | tsJapi.ErrorDocument | null;
      page: PageOptions;
      filter: FilterOptions;
      sort: SortOptions;
    }
  }
}
