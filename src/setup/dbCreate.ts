import Config from "../Config";
import createDatabase from "../orm/utils/createDatabase";

if (require.main === module) {
  createDatabase(Config.dbName)
    .then(() => {
      process.exit();
    })
    .catch((error) => {
      console.error(`Error encountered while creating database ${Config.dbName}:`, error);
      process.exit(1);
    });
}
