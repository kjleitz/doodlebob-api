import setupDataSource from "../config/setupDataSource";
import initDataSource from "./initDataSource";

export default function databaseExists(dbName: string): Promise<boolean> {
  return initDataSource(setupDataSource).then((ds) =>
    ds.query(`SELECT EXISTS (SELECT * FROM pg_database WHERE datname = '${dbName}')`).then(([{ exists }]) => exists),
  );
}
