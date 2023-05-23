import { NextFunction, Request, Response } from "express";
import InvalidInputError from "../../../lib/errors/app/InvalidInputError";
import parseSortString from "../../../lib/sort/parseSortString";

export default function setSort(req: Request, res: Response, next: NextFunction): void {
  const sortParam = req.query.sort;

  if (!sortParam) {
    req.sort = [];
    return next();
  }

  if (typeof sortParam !== "string")
    return next(new InvalidInputError("sort", "Query parameter 'sort' must be a comma-delimited string."));

  req.sort = parseSortString(sortParam);

  next();
}
