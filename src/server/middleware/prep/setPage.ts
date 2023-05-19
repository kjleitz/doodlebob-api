import { NextFunction, Request, Response } from "express";
import { isObject } from "../../../lib/utils/objects";
import PageOptions from "../../../lib/pagination/PageOptions";
import { Dict } from "../../../lib/utils/types";

const PAGE_DEFAULTS = {
  skip: 0,
  take: 50,
  given: false,
} as const;

const toPositiveInt = (value: any): number | null => {
  if (typeof value === "number") return isNaN(value) ? null : Math.max(Math.floor(value), 0);
  if (typeof value === "string") return toPositiveInt(parseInt(value, 10));
  return null;
};

export default function setDocument(req: Request, res: Response, next: NextFunction): void {
  if (isObject(req.query.page)) {
    const pageOptions = req.query.page as Dict;
    req.page = {
      skip: toPositiveInt(pageOptions.skip) ?? PAGE_DEFAULTS.skip,
      take: toPositiveInt(pageOptions.take) ?? PAGE_DEFAULTS.take,
      given: true,
    };
  } else {
    req.page = { ...PAGE_DEFAULTS };
  }

  next();
}
