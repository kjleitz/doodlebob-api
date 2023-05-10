import { Response } from "express";
import Config from "../../../Config";
import { REFRESH_TOKEN_COOKIE } from "../../../constants";

export default function setRefreshTokenOnResponse(response: Response, refreshToken: string): void {
  response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    secure: !Config.isLocal,
    httpOnly: true,
    sameSite: "none",
  });
}
