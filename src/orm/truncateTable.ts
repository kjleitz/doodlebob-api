import { EntityMetadata } from "typeorm";
import Config from "../Config";
import initDataSource from "./initDataSource";

export default function truncateTable(entityMetadata: EntityMetadata): Promise<void> {
  if (Config.isProd) return Promise.reject(new Error("Don't truncate tables in production, doofus."));

  return initDataSource().then((ds) => {
    const repository = ds.getRepository(entityMetadata.name);
    return repository.query(`TRUNCATE "${entityMetadata.tableName}" RESTART IDENTITY CASCADE`);
  });
}
