import noteSeeder from "../orm/seeders/noteSeeder";
import userSeeder from "../orm/seeders/userSeeder";
import seedDatabase from "../orm/utils/seedDatabase";

export const SEEDERS = [userSeeder, noteSeeder];

if (require.main === module) {
  seedDatabase(SEEDERS)
    .then(() => {
      process.exit();
    })
    .catch((error) => {
      console.error("Error encountered while seeding the database:", error);
      process.exit(1);
    });
}
