import { MigrationInterface, QueryRunner } from "typeorm";
import User from "../entities/User";
import { CreateUserData, buildUser } from "../../lib/users/userData";

const USER_SEEDS: CreateUserData[] = [
  {
    username: "admin",
    email: "admin@admin.com",
    password: "p4ssw0rd",
  },
  {
    username: "standard",
    email: undefined,
    password: "p4ssw0rd",
  },
  {
    username: "skyler.white",
    email: "skyler.white@test.com",
    password: "p4ssw0rd",
  },
  {
    username: "hank.schrader",
    email: "hank.schrader@test.com",
    password: "p4ssw0rd",
  },
  {
    username: "marie.schrader",
    email: undefined,
    password: "p4ssw0rd",
  },
  {
    username: "saul.goodman",
    email: "saul.goodman@test.com",
    password: "p4ssw0rd",
  },
  {
    username: "gustavo.fring",
    email: "gustavo.fring@test.com",
    password: "p4ssw0rd",
  },
  {
    username: "michael.ehrmantraut",
    email: "",
    password: "p4ssw0rd",
  },
  {
    username: "hector.salamanca",
    email: "hector.salamanca@test.com",
    password: "p4ssw0rd",
  },
  {
    username: "alberto.salamanca",
    email: "",
    password: "p4ssw0rd",
  },
];

export class Users1682953111697 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.manager.getRepository(User);

    const saves = USER_SEEDS.map((seed) => buildUser(seed).then((user) => userRepository.save(user)));

    await Promise.all(saves);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.manager.getRepository(User);

    const deletes = USER_SEEDS.map(({ username }) =>
      userRepository.findOneBy({ username }).then((user) => user && userRepository.delete(user.id)),
    );

    await Promise.all(deletes);
  }
}
