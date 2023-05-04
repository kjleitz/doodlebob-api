import Config from "../Config";
import setupDataSource from "../orm/config/setupDataSource";

const dropDatabase = (): Promise<void> => {
  console.log("Initializing setupDataSource...");

  return setupDataSource.initialize().then((ds) => {
    console.log("Initialized setupDataSource.");
    console.log(`Dropping database ${Config.dbName}...`);

    return ds.query(`DROP DATABASE "${Config.dbName}"`).then((result) => {
      console.log(result);
      console.log(`Dropped database ${Config.dbName}.`);
    });
  });
};

export default dropDatabase;

if (require.main === module) {
  dropDatabase()
    .then(() => {
      process.exit();
    })
    .catch((error) => {
      console.error("Error encountered while dropping the database:", error);
      process.exit(1);
    });
}
