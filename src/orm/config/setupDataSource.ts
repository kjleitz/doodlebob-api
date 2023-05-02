import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "../../Config";

export const setupDataSource = new DataSource({
  type: "postgres",
  host: Config.pgHost,
  port: Config.pgPort,
  username: Config.pgUser,
  password: Config.pgPass,
  database: "postgres",
  synchronize: false,
  logging: Config.ormLogging,
});
