import Role from "../../lib/auth/Role";
import buildUserAdmin from "../../lib/builders/users/buildUserAdmin";
import { UserAdminCreateAttributes } from "../../server/schemata/jsonApiUsers";
import User from "../entities/User";
import Seeder from "./Seeder";

export const USER_SEEDS: UserAdminCreateAttributes[] = [
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

const userSeeder: Seeder<User[]> = (entityManager) => {
  const userRepository = entityManager.getRepository(User);
  const saves = USER_SEEDS.map((seed) => buildUserAdmin(seed).then((user) => userRepository.save(user)));
  return Promise.all(saves);
};

export default userSeeder;
