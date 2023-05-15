import { EntityManager } from "typeorm";

// type Seeder = <R>(entityManager: EntityManager) => Promise<R>;

// export default Seeder;

export default interface Seeder<R> {
  (entityManager: EntityManager): Promise<R>;
}
