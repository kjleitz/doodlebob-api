import Config from "../Config";
import Seeder from "./Seeder";
import initDataSource from "./initDataSource";

export default function runSeeder<R>(seeder: Seeder<R>): Promise<R> {
  if (Config.isProd) return Promise.reject(new Error("Don't run seeds in production, doofus."));

  return initDataSource().then((ds) => ds.transaction((entityManager) => seeder(entityManager)));
}
