import Config from "../Config";
import setupDataSource from "../orm/config/setupDataSource";

const createDatabase = (): Promise<void> => {
  console.log("Initializing setupDataSource...");

  return setupDataSource.initialize().then((ds) => {
    console.log("Initialized setupDataSource.");
    console.log(`Checking if database ${Config.dbName} already exists...`);

    return ds
      .query(`SELECT EXISTS (SELECT * FROM pg_database WHERE datname = '${Config.dbName}')`)
      .then(([{ exists }]) => {
        if (exists) {
          console.log(`Database ${Config.dbName} already exists. Skipping...`);
        } else {
          console.log(`Database ${Config.dbName} does not yet exist. Creating...`);
          return ds.query(`CREATE DATABASE "${Config.dbName}"`).then((result) => {
            console.log(result);
            console.log(`Created database ${Config.dbName}.`);
          });
        }
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
      console.error(`Error encountered while creating database ${Config.dbName}:`, error);
      process.exit(1);
    });
}
