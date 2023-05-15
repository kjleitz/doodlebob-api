import Config from "../../Config";
import Seeder from "../seeders/Seeder";
import runSeeders from "./runSeeders";
import truncateDatabase from "./truncateDatabase";

export default function seedDatabase<R, S extends Seeder<R>>(seeders: S[]): Promise<R[]> {
  if (Config.isProd) return Promise.reject(new Error("Don't run seeds in production, doofus."));

  return truncateDatabase().then(() => runSeeders(seeders));
}
