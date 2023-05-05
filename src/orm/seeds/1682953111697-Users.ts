import { MigrationInterface, QueryRunner } from "typeorm";
import User from "../entities/User";
import Role from "../../lib/auth/Role";
import UserAdminCreateAttributes from "../../lib/permitters/users/UserAdminCreateAttributes";
import buildUserAdmin from "../../lib/builders/users/buildUserAdmin";

const USER_SEEDS: UserAdminCreateAttributes[] = [
  {
    username: "admin",
    email: "admin@admin.com",
    role: Role.ADMIN,
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
    role: Role.ADMIN,
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
    role: Role.PEASANT,
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

    const saves = USER_SEEDS.map((seed) => buildUserAdmin(seed).then((user) => userRepository.save(user)));

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
