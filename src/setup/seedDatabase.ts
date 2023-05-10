import Config from "../Config";
import runSeeders from "../orm/runSeeders";
import userSeeder from "../orm/seeders/userSeeder";
import truncateDatabase from "../orm/truncateDatabase";

const SEEDERS = [userSeeder];

export default function seedDatabase() {
  if (Config.isProd) return Promise.reject(new Error("Don't run seeds in production, doofus."));

  return truncateDatabase().then(() => runSeeders(SEEDERS));
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit();
    })
    .catch((error) => {
      console.error("Error encountered while seeding the database:", error);
      process.exit(1);
    });
}
