import { Response } from "express";
import { ACCESS_TOKEN_HEADER, REFRESH_TOKEN_COOKIE } from "../../../constants";

export default function deleteTokensOnResponse(response: Response): void {
  response.clearCookie(REFRESH_TOKEN_COOKIE);
  response.removeHeader(ACCESS_TOKEN_HEADER);
}
