import "mocha";
import { expect } from "chai";
import { randomUUID } from "node:crypto";
import { SuperAgentTest, agent } from "supertest";
import { app } from "../..";
import LoginSerializer from "../../lib/serializers/LoginSerializer";
import DataSerializer from "../../lib/serializers/DataSerializer";
import HttpStatus from "../../lib/errors/HttpStatus";
import appDataSource from "../../orm/config/appDataSource";
import { ACCESS_TOKEN_HEADER } from "../../constants";
import { authHeaderForAccessToken } from "../../lib/utils/tests";
import User from "../../orm/entities/User";
import Role from "../../lib/auth/Role";
import truncateDatabase from "../../orm/truncateDatabase";
import userSeeder from "../../orm/seeders/userSeeder";
import runSeeder from "../../orm/runSeeder";

const MY_USER = "skyler.white";
const OTHER_USER = "marie.schrader";
const ADMIN_USER = "admin";

const userRepository = appDataSource.getRepository(User);

const signIn = (username = MY_USER, password = "p4ssw0rd"): Promise<SuperAgentTest> => {
  return LoginSerializer.serialize({ username, password })
    .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
    .then((response) => {
      expect(response.status).to.equal(HttpStatus.OK);
      const accessToken = response.get(ACCESS_TOKEN_HEADER);
      const cookie = response.get("Set-Cookie");
      const authedAgent = agent(app);
      authedAgent.set("Cookie", cookie).set("Authorization", authHeaderForAccessToken(accessToken));
      return authedAgent;
    });
};

const getUser = (username = MY_USER): Promise<User> => {
  return userRepository.findOneByOrFail({ username });
};

describe("Users", () => {
  let dirty = false;

  before(() => {
    return appDataSource
      .initialize()
      .then(() => truncateDatabase())
      .then(() => runSeeder(userSeeder));
  });

  after(() => {
    return appDataSource.destroy();
  });

  afterEach(() => {
    if (dirty)
      return truncateDatabase()
        .then(() => runSeeder(userSeeder))
        .then(() => {
          dirty = false;
        });
  });

  describe("index", () => {
    it("requires auth", () => {
      return agent(app).get("/users").send().expect(HttpStatus.UNAUTHORIZED);
    });

    it("returns a list of users", () => {
      return signIn()
        .then((authed) => authed.get("/users").send())
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.data).to.be.an("array");
        });
    });
  });

  describe("show", () => {
    it("requires auth", () => {
      return getUser().then(({ id }) => agent(app).get(`/users/${id}`).send().expect(HttpStatus.UNAUTHORIZED));
    });

    it("requires you to be the user", () => {
      return getUser(OTHER_USER).then(({ id }) =>
        signIn(MY_USER)
          .then((authed) => authed.get(`/users/${id}`).send())
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.FORBIDDEN);
          }),
      );
    });

    it("returns your user info", () => {
      return getUser(MY_USER).then(({ id }) =>
        signIn(MY_USER)
          .then((authed) => authed.get(`/users/${id}`).send())
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.OK);
            expect(response.body.data.type).to.equal("users");
            expect(response.body.data.attributes.username).to.equal(MY_USER);
          }),
      );
    });
  });

  describe("create", () => {
    it("requires auth", () => {
      dirty = true;
      const uuid = randomUUID();

      const userData = {
        username: `poopsmith-${uuid}`,
        password: "p4ssw0rd",
        email: `the.poopsmith-${uuid}@homestarrunner.com`,
      };

      return DataSerializer.serialize(userData).then((serialized) =>
        agent(app).post(`/users`).send(serialized).expect(HttpStatus.UNAUTHORIZED),
      );
    });

    it("requires admin", () => {
      dirty = true;
      const uuid = randomUUID();

      const userData = {
        username: `poopsmith-${uuid}`,
        password: "p4ssw0rd",
        email: `the.poopsmith-${uuid}@homestarrunner.com`,
      };

      return DataSerializer.serialize(userData).then((serialized) =>
        signIn(MY_USER).then((authed) => authed.post(`/users`).send(serialized).expect(HttpStatus.FORBIDDEN)),
      );
    });

    it("creates a new user", () => {
      dirty = true;
      const uuid = randomUUID();

      const userData = {
        username: `poopsmith-${uuid}`,
        password: "p4ssw0rd",
        email: `the.poopsmith-${uuid}@homestarrunner.com`,
      };

      return userRepository.count().then((originalCount) => {
        return DataSerializer.serialize(userData).then((serialized) => {
          return signIn(ADMIN_USER)
            .then((authed) => authed.post(`/users`).send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.CREATED);
              expect(response.body.data.attributes.username).to.equal(userData.username);
              return userRepository.count();
            })
            .then((finalCount) => {
              expect(finalCount).to.equal(originalCount + 1);
            });
        });
      });
    });

    it("can create a new user with an elevated role (as admin)", () => {
      dirty = true;
      const uuid = randomUUID();

      const userData = {
        username: `poopsmith-${uuid}`,
        role: Role.ADMIN,
        password: "p4ssw0rd",
        email: `the.poopsmith-${uuid}@homestarrunner.com`,
      };

      return DataSerializer.serialize(userData).then((serialized) => {
        return signIn(ADMIN_USER)
          .then((authed) => authed.post(`/users`).send(serialized))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.CREATED);
            expect(response.body.data.attributes.username).to.equal(userData.username);
            expect(response.body.data.attributes.role).to.equal(userData.role);
          });
      });
    });

    it("cannot create users with duplicate usernames", () => {
      dirty = true;
      const userData = {
        username: OTHER_USER,
        password: "p4ssw0rd",
        email: "the.poopsmith-${uuid}@homestarrunner.com",
      };

      return DataSerializer.serialize(userData).then((serialized) => {
        return signIn(ADMIN_USER)
          .then((authed) => authed.post(`/users`).send(serialized))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.UNPROCESSABLE_ENTITY);
            expect(response.body.errors[0].detail).to.match(/Username .* already exists/);
          });
      });
    });
  });

  describe("update", () => {
    it("requires auth", () => {
      dirty = true;
      let oldEmail: string;
      let newEmail: string;

      return getUser(MY_USER).then((user) => {
        oldEmail = user.email;
        newEmail = randomUUID() + user.email;

        return DataSerializer.serialize({ email: newEmail }).then((serialized) => {
          return agent(app)
            .patch(`/users/${user.id}`)
            .send(serialized)
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.UNAUTHORIZED);
            });
        });
      });
    });

    it("requires you to be the user", () => {
      dirty = true;
      let oldEmail: string;
      let newEmail: string;

      return getUser(OTHER_USER).then((otherUser) => {
        oldEmail = otherUser.email;
        newEmail = randomUUID() + otherUser.email;

        return DataSerializer.serialize({ email: newEmail }).then((serialized) => {
          return signIn(MY_USER)
            .then((authed) => authed.patch(`/users/${otherUser.id}`).send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.FORBIDDEN);
            });
        });
      });
    });

    it("allows a user to update their own attributes", () => {
      dirty = true;
      let oldEmail: string;
      let newEmail: string;

      return getUser(MY_USER).then((user) => {
        oldEmail = user.email;
        newEmail = randomUUID() + user.email;

        return DataSerializer.serialize({ email: newEmail }).then((serialized) => {
          return signIn(MY_USER)
            .then((authed) => authed.patch(`/users/${user.id}`).send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              expect(response.body.data.attributes.email).to.equal(newEmail);
            });
        });
      });
    });

    it("prevents a peasant user from changing their role", () => {
      dirty = true;
      return getUser(MY_USER).then((user) => {
        expect(user.role).to.equal(Role.PEASANT);

        return DataSerializer.serialize({ role: Role.ADMIN }).then((serialized) => {
          return signIn(MY_USER)
            .then((authed) => authed.patch(`/users/${user.id}`).send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              expect(response.body.data.attributes.role).to.equal(Role.PEASANT);
            });
        });
      });
    });

    it("allows an admin user to change an arbitrary user's role", () => {
      dirty = true;
      return getUser(MY_USER).then((user) => {
        expect(user.role).to.equal(Role.PEASANT);

        return DataSerializer.serialize({ role: Role.ADMIN }).then((serialized) => {
          return signIn(ADMIN_USER)
            .then((authed) => authed.patch(`/users/${user.id}`).send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              expect(response.body.data.attributes.role).to.equal(Role.ADMIN);
            });
        });
      });
    });
  });

  describe("destroy", () => {
    it("requires auth", () => {
      dirty = true;

      return getUser(MY_USER)
        .then(({ id }) => agent(app).delete(`/users/${id}`).send())
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.UNAUTHORIZED);
        });
    });

    it("requires you to be the user", () => {
      dirty = true;

      return getUser(OTHER_USER)
        .then(({ id }) => signIn(MY_USER).then((authed) => authed.delete(`/users/${id}`).send()))
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.FORBIDDEN);
        });
    });

    it("allows a user to delete themselves", () => {
      dirty = true;

      return getUser(MY_USER)
        .then(({ id }) => signIn(MY_USER).then((authed) => authed.delete(`/users/${id}`).send()))
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          return userRepository.findOneBy({ username: MY_USER });
        })
        .then((user) => {
          expect(user).to.be.null;
        });
    });

    it("allows an admin user to delete arbitrary users", () => {
      dirty = true;

      return getUser(MY_USER)
        .then(({ id }) => signIn(ADMIN_USER).then((authed) => authed.delete(`/users/${id}`).send()))
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          return userRepository.findOneBy({ username: MY_USER });
        })
        .then((user) => {
          expect(user).to.be.null;
        });
    });
  });
});
