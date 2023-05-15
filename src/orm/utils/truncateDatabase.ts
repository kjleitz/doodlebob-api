import Config from "../../Config";
import initDataSource from "./initDataSource";

export default function truncateDatabase(): Promise<any[]> {
  if (Config.isProd) return Promise.reject(new Error("Don't truncate the database in production, doofus."));

  return initDataSource().then((ds) => {
    return Promise.all(
      ds.entityMetadatas.map((entityMetadata) => {
        const repository = ds.getRepository(entityMetadata.name);
        return repository.query(`TRUNCATE "${entityMetadata.tableName}" RESTART IDENTITY CASCADE`);
      }),
    );
  });
}
