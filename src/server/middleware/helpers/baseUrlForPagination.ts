import { Request } from "express";

export default function baseUrlForPagination(req: Request): string {
  const url = new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);
  url.searchParams.delete("page[index]");
  url.searchParams.delete("page[size]");
  return url.href;
}
