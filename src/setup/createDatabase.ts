import { DataSource } from "typeorm";
import { parseBool } from "../utils/parsing";

export const createDatabase = (): Promise<void> => {
  const createDbDataSource = new DataSource({
    type: "postgres",
    host: process.env.TYPEORM_HOST ?? "localhost",
    port: parseInt(process.env.TYPEORM_PORT ?? "5432", 10),
    username: process.env.TYPEORM_USERNAME ?? "postgres",
    password: process.env.TYPEORM_PASSWORD ?? "postgres",
    database: "postgres",
    synchronize: false,
    logging: parseBool(process.env.TYPEORM_LOGGING),
  });

  const env = process.env.APP_ENV ?? "development";
  const dbName = process.env.TYPEORM_DATABASE ?? `doodlebob-${env}`;

  console.log("Initializing createDbDataSource...");

  return createDbDataSource.initialize().then((ds) => {
    console.log("Initialized createDbDataSource.");
    console.log(`Creating database ${dbName}...`);

    return ds.query(`CREATE DATABASE ${dbName}`).then((result) => {
      console.log(result);
      console.log(`Created database ${dbName}.`);
    });
  });
};

