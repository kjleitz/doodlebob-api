import setupDataSource from "../config/setupDataSource";
import databaseExists from "./databaseExists";
import initDataSource from "./initDataSource";

export default function createDatabase(dbName: string): Promise<void> {
  console.log("Initializing setupDataSource...");

  return initDataSource(setupDataSource).then((ds) => {
    console.log("Initialized setupDataSource.");
    console.log(`Checking if database ${dbName} already exists...`);

    return databaseExists(dbName).then((exists) => {
      if (exists) {
        console.log(`Database ${dbName} already exists. Skipping...`);
      } else {
        console.log(`Database ${dbName} does not yet exist. Creating...`);
        return ds.query(`CREATE DATABASE "${dbName}"`).then((result) => {
          console.log(result);
          console.log(`Created database ${dbName}.`);
        });
      }
    });
  });
}
