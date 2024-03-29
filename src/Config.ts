import crypto from "crypto";
import { parseBool } from "./lib/utils/parsing";

export enum NodeEnv {
  TEST = "test",
  DEV = "development",
  STAGING = "staging",
  PROD = "production",
}

const {
  NODE_ENV,
  PORT,
  PG_HOST,
  PG_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  JWT_SECRET,
  JWT_EXPIRATION,
  JWT_REFRESH_EXPIRATION,
  TYPEORM_SYNCHRONIZE,
  TYPEORM_LOGGING,
  MAX_TOTAL_LOGS_SIZE,
} = process.env;

const DEFAULT_PORT = 4000;
const DEFAULT_PG_HOST = "database";
const DEFAULT_PG_PORT = 5432;
const DEFAULT_PG_USER = "postgres";
const DEFAULT_PG_PASS = "postgres";
const DEFAULT_DB_NAME = `doodlebob-${NODE_ENV ?? NodeEnv.DEV}`;
const DEFAULT_JWT_EXP = "15m";
const DEFAULT_JWT_REFRESH_EXP = "30d";
const DEFAULT_ORM_SYNC = false;
const DEFAULT_ORM_LOGGING = true;
const DEFAULT_MAX_TOTAL_LOGS_SIZE = "1G"; // 1 GB before old log files are deleted

// If no JWT_SECRET is specified, the random secret will expire all JWTs if and
// when the server restarts. That's probably *not* what you want, so you should
// definitely specify one in your env vars.
const generateDefaultJwtSecret = (): string => crypto.randomBytes(32).toString("hex");

export default class Config {
  static readonly env = (NODE_ENV as NodeEnv | undefined) ?? NodeEnv.DEV;
  static readonly port = PORT ? parseInt(PORT, 10) : DEFAULT_PORT;
  static readonly pgHost = PG_HOST ?? DEFAULT_PG_HOST;
  static readonly pgPort = PG_PORT ? parseInt(PG_PORT, 10) : DEFAULT_PG_PORT;
  static readonly pgUser = POSTGRES_USER ?? DEFAULT_PG_USER;
  static readonly pgPass = POSTGRES_PASSWORD ?? DEFAULT_PG_PASS;
  static readonly dbName = POSTGRES_DB ?? DEFAULT_DB_NAME;
  static readonly jwtSecret = JWT_SECRET ?? generateDefaultJwtSecret();
  static readonly jwtExp = JWT_EXPIRATION ?? DEFAULT_JWT_EXP;
  static readonly jwtRefreshExp = JWT_REFRESH_EXPIRATION ?? DEFAULT_JWT_REFRESH_EXP;
  static readonly ormSync = parseBool(TYPEORM_SYNCHRONIZE) ?? DEFAULT_ORM_SYNC;
  static readonly ormLogging = parseBool(TYPEORM_LOGGING) ?? DEFAULT_ORM_LOGGING;
  static readonly logsMaxSize = MAX_TOTAL_LOGS_SIZE ?? DEFAULT_MAX_TOTAL_LOGS_SIZE;

  static get isTest(): boolean {
    return this.env === NodeEnv.TEST;
  }

  static get isDev(): boolean {
    return this.env === NodeEnv.DEV;
  }

  static get isLocal(): boolean {
    return this.isTest || this.isDev;
  }

  static get isStaging(): boolean {
    return this.env === NodeEnv.STAGING;
  }

  static get isPreProd(): boolean {
    return this.isStaging;
  }

  static get isProd(): boolean {
    return this.env === NodeEnv.PROD;
  }
}
