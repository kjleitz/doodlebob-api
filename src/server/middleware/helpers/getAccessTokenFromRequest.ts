import { Request } from "express";

export default function getAccessTokenFromRequest(request: Request): string | null {
  const authHeader = request.get("Authorization");
  if (!authHeader) return null;

  const accessToken = authHeader.split(" ")[1];
  return accessToken ?? null;
}
