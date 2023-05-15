import Config from "../Config";
import dropDatabase from "../orm/utils/dropDatabase";

if (require.main === module) {
  dropDatabase(Config.dbName)
    .then(() => {
      process.exit();
    })
    .catch((error) => {
      console.error("Error encountered while dropping the database:", error);
      process.exit(1);
    });
}
