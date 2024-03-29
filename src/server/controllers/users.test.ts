import { expect } from "chai";
import "mocha";
import { randomUUID } from "node:crypto";
import { agent } from "supertest";
import { app } from "../..";
import Role from "../../lib/auth/Role";
import HttpStatus from "../../lib/errors/HttpStatus";
import LoginSerializer from "../../lib/serializers/LoginSerializer";
import UserSerializer from "../../lib/serializers/UserSerializer";
import UserUpdateSerializer from "../../lib/serializers/UserUpdateSerializer";
import appDataSource from "../../orm/config/appDataSource";
import User from "../../orm/entities/User";
import userSeeder from "../../orm/seeders/userSeeder";
import runSeeder from "../../orm/utils/runSeeder";
import truncateDatabase from "../../orm/utils/truncateDatabase";
import { signIn } from "../../testing/utils";
import { UserCollectionDocument } from "../schemata/jsonApiUsers";

const MY_USER = "skyler.white";
const OTHER_USER = "marie.schrader";
const ADMIN_USER = "admin";

const userRepository = appDataSource.getRepository(User);

const getUser = (username = MY_USER): Promise<User> => {
  return userRepository.findOneByOrFail({ username });
};

describe("Users controller", () => {
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

  describe("Index", () => {
    it("requires auth", () => {
      return agent(app).get("/users").send().expect(HttpStatus.UNAUTHORIZED);
    });

    it("requires admin", () => {
      return signIn(MY_USER).then(({ authed }) => authed.get("/users").send().expect(HttpStatus.FORBIDDEN));
    });

    it("returns a list of users", () => {
      return signIn(ADMIN_USER)
        .then(({ authed }) => authed.get("/users").send())
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.data).to.be.an("array");
        });
    });

    it("sorts the returned users by created at, descending, by default", () => {
      return signIn(ADMIN_USER)
        .then(({ authed }) => authed.get("/users").send())
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          const document = response.body as UserCollectionDocument;
          expect(document.data).to.be.an("array");

          let prevCreatedAt = new Date(document.data[0].attributes.createdAt);
          for (let i = 1; i < document.data.length; i++) {
            const createdAt = new Date(document.data[i].attributes.createdAt);
            expect(createdAt).to.be.lessThanOrEqual(prevCreatedAt);
            prevCreatedAt = createdAt;
          }
        });
    });

    it("sorts the returned users by given preference", () => {
      return signIn(ADMIN_USER)
        .then(({ authed }) => authed.get("/users?sort=-username").send())
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          const document = response.body as UserCollectionDocument;
          expect(document.data).to.be.an("array");

          let prevUsername = document.data[0].attributes.username;
          for (let i = 1; i < document.data.length; i++) {
            const { username } = document.data[i].attributes;
            expect([prevUsername, username].sort()).to.deep.equal([username, prevUsername]);
            prevUsername = username;
          }
        });
    });

    it("paginates the returned list of users", () => {
      return signIn(ADMIN_USER)
        .then(({ authed }) => authed.get("/users").send())
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.data).to.be.an("array");
          expect(response.body.links).not.to.be.undefined;
          expect(response.body.links.first).to.be.a("string");
          expect(response.body.links.last).to.be.a("string");
        });
    });
  });

  describe("Show", () => {
    it("requires auth", () => {
      return getUser().then(({ id }) => agent(app).get(`/users/${id}`).send().expect(HttpStatus.UNAUTHORIZED));
    });

    it("requires you to be the user", () => {
      return getUser(OTHER_USER).then(({ id }) =>
        signIn(MY_USER)
          .then(({ authed }) => authed.get(`/users/${id}`).send())
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.FORBIDDEN);
          }),
      );
    });

    it("returns your user info", () => {
      return getUser(MY_USER).then(({ id }) =>
        signIn(MY_USER)
          .then(({ authed }) => authed.get(`/users/${id}`).send())
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.OK);
            expect(response.body.data.type).to.equal("users");
            expect(response.body.data.attributes.username).to.equal(MY_USER);
          }),
      );
    });
  });

  describe("Create", () => {
    it("requires auth", () => {
      dirty = true;
      const uuid = randomUUID();

      const userData = {
        username: `poopsmith-${uuid}`,
        password: "p4ssw0rd",
        email: `the.poopsmith-${uuid}@homestarrunner.com`,
      };

      return UserSerializer.serialize(userData).then((serialized) =>
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

      return UserSerializer.serialize(userData).then((serialized) =>
        signIn(MY_USER).then(({ authed }) => authed.post(`/users`).send(serialized).expect(HttpStatus.FORBIDDEN)),
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
        return UserSerializer.serialize(userData).then((serialized) => {
          return signIn(ADMIN_USER)
            .then(({ authed }) => authed.post(`/users`).send(serialized))
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

      return UserSerializer.serialize(userData).then((serialized) => {
        return signIn(ADMIN_USER)
          .then(({ authed }) => authed.post(`/users`).send(serialized))
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

      return UserSerializer.serialize(userData).then((serialized) => {
        return signIn(ADMIN_USER)
          .then(({ authed }) => authed.post(`/users`).send(serialized))
          .then((response) => {
            expect(response.status).to.equal(HttpStatus.UNPROCESSABLE_ENTITY);
            expect(response.body.errors[0].detail).to.match(/Username .* already exists/);
          });
      });
    });
  });

  describe("Update", () => {
    it("requires auth", () => {
      dirty = true;
      let oldEmail: string;
      let newEmail: string;

      return getUser(MY_USER).then((user) => {
        oldEmail = user.email;
        newEmail = randomUUID() + user.email;

        return UserSerializer.serialize({ email: newEmail }).then((serialized) => {
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

        return UserSerializer.serialize({ email: newEmail }).then((serialized) => {
          return signIn(MY_USER)
            .then(({ authed }) => authed.patch(`/users/${otherUser.id}`).send(serialized))
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

        return UserSerializer.serialize({ email: newEmail }).then((serialized) => {
          return signIn(MY_USER)
            .then(({ authed }) => authed.patch(`/users/${user.id}`).send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              expect(response.body.data.attributes.email).to.equal(newEmail);
            });
        });
      });
    });

    it("requires the old password in order to update a user's password", () => {
      dirty = true;
      const password = "p4ssw0rd";
      const newPassword = "thingamajig";
      const oldPassword = undefined;
      expect(oldPassword).not.to.equal(password);

      return UserUpdateSerializer.serialize({ newPassword, oldPassword }).then((serialized) => {
        return (
          signIn(MY_USER)
            // Update to new password fails because old password is not supplied
            .then(({ authed, id }) => authed.patch(`/users/${id}`).send(serialized))
            .then((response) => expect(response.status).to.equal(HttpStatus.UNPROCESSABLE_ENTITY))
            // Sign-in with new password fails
            .then(() => LoginSerializer.serialize({ username: MY_USER, password: newPassword }))
            .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
            .then((response) => expect(response.status).to.equal(HttpStatus.UNAUTHORIZED))
            // Sign-in with old password still works
            .then(() => LoginSerializer.serialize({ username: MY_USER, password }))
            .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
            })
        );
      });
    });

    it("requires the old password to be correct in order to update a user's password", () => {
      dirty = true;
      const password = "p4ssw0rd";
      const newPassword = "thingamajig";
      const oldPassword = "nopethisiswrong";
      expect(oldPassword).not.to.equal(password);

      return UserUpdateSerializer.serialize({ newPassword, oldPassword }).then((serialized) => {
        return (
          signIn(MY_USER)
            // Update to new password fails because old password is wrong
            .then(({ authed, id }) => authed.patch(`/users/${id}`).send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.UNAUTHORIZED);
            })
            // Sign-in with new password fails
            .then(() => LoginSerializer.serialize({ username: MY_USER, password: newPassword }))
            .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.UNAUTHORIZED);
            })
            // Sign-in with old password still works
            .then(() => LoginSerializer.serialize({ username: MY_USER, password }))
            .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK, JSON.stringify(response.body.errors));
            })
        );
      });
    });

    it("allows the user to update their password", () => {
      dirty = true;
      const password = "p4ssw0rd";
      const newPassword = "thingamajig";
      const oldPassword = "p4ssw0rd";
      expect(oldPassword).to.equal(password);

      return UserUpdateSerializer.serialize({ newPassword, oldPassword }).then((serialized) => {
        return (
          signIn(MY_USER)
            // Update to new password succeeds
            .then(({ authed, id }) => authed.patch(`/users/${id}`).send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
            })
            // Sign-in with new password succeeds
            .then(() => LoginSerializer.serialize({ username: MY_USER, password: newPassword }))
            .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
            })
            // Sign-in with old password no longer works
            .then(() => LoginSerializer.serialize({ username: MY_USER, password }))
            .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.UNAUTHORIZED);
            })
        );
      });
    });

    it("prevents a peasant user from changing their role", () => {
      dirty = true;
      return getUser(MY_USER).then((user) => {
        expect(user.role).to.equal(Role.PEASANT);

        return UserSerializer.serialize({ role: Role.ADMIN }).then((serialized) => {
          return signIn(MY_USER)
            .then(({ authed }) => authed.patch(`/users/${user.id}`).send(serialized))
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

        return UserSerializer.serialize({ role: Role.ADMIN }).then((serialized) => {
          return signIn(ADMIN_USER)
            .then(({ authed }) => authed.patch(`/users/${user.id}`).send(serialized))
            .then((response) => {
              expect(response.status).to.equal(HttpStatus.OK);
              expect(response.body.data.attributes.role).to.equal(Role.ADMIN);
            });
        });
      });
    });
  });

  describe("Destroy", () => {
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
        .then(({ id }) => signIn(MY_USER).then(({ authed }) => authed.delete(`/users/${id}`).send()))
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.FORBIDDEN);
        });
    });

    it("allows a user to delete themselves", () => {
      dirty = true;

      return signIn(MY_USER)
        .then(({ authed, id }) => authed.delete(`/users/${id}`).send())
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
        .then(({ id }) => signIn(ADMIN_USER).then(({ authed }) => authed.delete(`/users/${id}`).send()))
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
