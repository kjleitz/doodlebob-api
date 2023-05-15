import "reflect-metadata";
import { DataSource } from "typeorm";
import Config from "../../Config";
import User from "../entities/User";
import Note from "../entities/Note";

const appDataSource = new DataSource({
  type: "postgres",
  host: Config.pgHost,
  port: Config.pgPort,
  username: Config.pgUser,
  password: Config.pgPass,
  database: Config.dbName,
  synchronize: Config.ormSync,
  logging: Config.ormLogging,
  entities: [User, Note],
  // I don't know if any of these glob patterns actually work. They certainly
  // don't work for the `entities` key.
  migrations: ["src/orm/migrations/**/*{.js,.ts}"],
  subscribers: ["src/orm/migrations/**/*{.js,.ts}"],
});

export default appDataSource;
