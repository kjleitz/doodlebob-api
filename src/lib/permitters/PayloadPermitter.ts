import { Request } from "express";

type PayloadPermitter = <T>(req: Request) => T;

export default PayloadPermitter;
