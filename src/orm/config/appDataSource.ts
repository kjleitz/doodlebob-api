import "reflect-metadata";
import { DataSource } from "typeorm";
import Config from "../../Config";

const appDataSource = new DataSource({
  type: "postgres",
  host: Config.pgHost,
  port: Config.pgPort,
  username: Config.pgUser,
  password: Config.pgPass,
  database: Config.dbName,
  synchronize: Config.ormSync,
  logging: Config.ormLogging,
  entities: ["src/orm/entities/**/*.ts"],
  migrations: ["src/orm/migrations/**/*.ts"],
  subscribers: ["src/orm/subscribers/**/*.ts"],
});

export default appDataSource;
