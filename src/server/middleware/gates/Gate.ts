import { NextFunction, Request, Response } from "express";

export default interface Gate {
  (request: Request, response: Response, next: NextFunction): void;
}
