import { Response } from "express";
import { ACCESS_TOKEN_HEADER } from "../../../constants";

export default function setAccessTokenOnResponse(response: Response, accessToken: string): void {
  response.setHeader(ACCESS_TOKEN_HEADER, accessToken);
}
