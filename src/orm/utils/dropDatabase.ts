import setupDataSource from "../config/setupDataSource";
import databaseExists from "./databaseExists";
import initDataSource from "./initDataSource";

export default function dropDatabase(dbName: string): Promise<void> {
  console.log("Initializing setupDataSource...");

  return initDataSource(setupDataSource).then((ds) => {
    console.log("Initialized setupDataSource.");
    console.log(`Checking if database ${dbName} exists...`);

    return databaseExists(dbName).then((exists) => {
      if (!exists) {
        console.log(`Database ${dbName} doesn't exist. Skipping...`);
      } else {
        console.log(`Database ${dbName} exists. Dropping...`);
        return ds.query(`DROP DATABASE "${dbName}"`).then((result) => {
          console.log(result);
          console.log(`Dropped database ${dbName}.`);
        });
      }
    });
  });
}
