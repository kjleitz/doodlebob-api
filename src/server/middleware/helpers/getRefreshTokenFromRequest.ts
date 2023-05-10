import { Request } from "express";
import { REFRESH_TOKEN_COOKIE } from "../../../constants";

export default function getRefreshTokenFromRequest(request: Request): string | null {
  if (!request.cookies) return null;

  return request.cookies[REFRESH_TOKEN_COOKIE] ?? null;
}
