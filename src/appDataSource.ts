import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { parseBool } from "./utils/parsing";

export const appDataSource = new DataSource({
  type: "postgres",
  host: process.env.TYPEORM_HOST ?? "localhost",
  port: parseInt(process.env.TYPEORM_PORT ?? "5432", 10),
  username: process.env.TYPEORM_USERNAME ?? "postgres",
  password: process.env.TYPEORM_PASSWORD ?? "postgres",
  database: process.env.TYPEORM_DATABASE ?? `doodlebob-${process.env.APP_ENV}`,
  synchronize: parseBool(process.env.TYPEORM_SYNCHRONIZE),
  logging: parseBool(process.env.TYPEORM_LOGGING),
  entities: [
    User,
  ],
  migrations: [],
  subscribers: [],
});
