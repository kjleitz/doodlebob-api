import { NextFunction, Request, Response } from "express";

export default function setDocument(req: Request, res: Response, next: NextFunction): void {
  req.document = req.body.data || req.body.errors ? req.body : null;
  next();
}
