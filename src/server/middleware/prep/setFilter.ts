import { NextFunction, Request, Response } from "express";
import { isObject } from "../../../lib/utils/objects";
import { Dict } from "../../../lib/utils/types";
import FilterOptions from "../../../lib/filter/FilterOptions";

const FILTER_DEFAULTS: FilterOptions = {
  q: null,
};

export default function setFilter(req: Request, res: Response, next: NextFunction): void {
  req.filter = { ...FILTER_DEFAULTS };

  const filter = req.query.filter as Dict | undefined;
  if (isObject(filter) && typeof filter.q === "string") req.filter.q = filter.q;

  next();
}
