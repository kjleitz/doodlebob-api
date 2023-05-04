import Config from "../Config";
import setupDataSource from "../orm/config/setupDataSource";

const createDatabase = (): Promise<void> => {
  console.log("Initializing setupDataSource...");

  return setupDataSource.initialize().then((ds) => {
    console.log("Initialized setupDataSource.");
    console.log(`Creating database ${Config.dbName}...`);

    return ds.query(`CREATE DATABASE "${Config.dbName}"`).then((result) => {
      console.log(result);
      console.log(`Created database ${Config.dbName}.`);
    });
  });
};

export default createDatabase;

if (require.main === module) {
  createDatabase()
    .then(() => {
      process.exit();
    })
    .catch((error) => {
      console.error("Error encountered while creating the database:", error);
      process.exit(1);
    });
}
