import Config from "../Config";
import Seeder from "./Seeder";
import initDataSource from "./initDataSource";

export default function runSeeders<R>(seeders: Seeder<R>[]): Promise<R[]> {
  if (Config.isProd) return Promise.reject(new Error("Don't run seeds in production, doofus."));

  return initDataSource().then((ds) =>
    ds.transaction((entityManager) => Promise.all(seeders.map((seeder) => seeder(entityManager)))),
  );
}
