import { NextFunction, Request, Response } from "express";
import { isObject } from "../../../lib/utils/objects";
import { Dict } from "../../../lib/utils/types";

const PAGE_DEFAULTS = {
  index: 0,
  size: 50, // this normally gets overwritten by a contextual max value
  given: false,
} as const;

const toPositiveInt = (value: any): number | null => {
  if (typeof value === "number") return isNaN(value) ? null : Math.max(Math.floor(value), 0);
  if (typeof value === "string") return toPositiveInt(parseInt(value, 10));
  return null;
};

export default function setPage(req: Request, res: Response, next: NextFunction): void {
  if (isObject(req.query.page)) {
    const pageOptions = req.query.page as Dict;
    req.page = {
      index: toPositiveInt(pageOptions.index) ?? PAGE_DEFAULTS.index,
      size: toPositiveInt(pageOptions.size) ?? PAGE_DEFAULTS.size,
      given: true,
    };
  } else {
    req.page = { ...PAGE_DEFAULTS };
  }

  next();
}
