import "mocha";
import assert from "node:assert";
import { agent } from "supertest";
import { app } from "../..";
import LoginSerializer from "../../lib/serializers/LoginSerializer";
import HttpStatus from "../../lib/errors/HttpStatus";
import appDataSource from "../../orm/config/appDataSource";
import { ACCESS_TOKEN_HEADER } from "../../constants";
import { authHeaderForAccessToken, wait } from "../../lib/utils/tests";
import truncateDatabase from "../../orm/truncateDatabase";
import runSeeder from "../../orm/runSeeder";
import userSeeder from "../../orm/seeders/userSeeder";

describe("Auth controller", () => {
  describe("Sign-in", () => {
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

    it("requires a username", () => {
      const creds = {
        // username: "skyler.white",
        password: "p4ssw0rd",
      };

      return LoginSerializer.serialize(creds)
        .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
        .then((response) => {
          assert.equal(response.status, HttpStatus.UNAUTHORIZED);
          assert.notEqual(typeof response.body.errors, "undefined");
          assert.notEqual(response.body.errors.length, 0);
        });
    });

    it("requires a password", () => {
      const creds = {
        username: "skyler.white",
        // password: "p4ssw0rd",
      };

      return LoginSerializer.serialize(creds)
        .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
        .then((response) => {
          assert.equal(response.status, HttpStatus.UNAUTHORIZED);
          assert.notEqual(typeof response.body.errors, "undefined");
          assert.notEqual(response.body.errors.length, 0);
        });
    });

    it("requires a correct username", () => {
      const creds = {
        username: "skyler.white.bogus",
        password: "p4ssw0rd",
      };

      return LoginSerializer.serialize(creds)
        .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
        .then((response) => {
          assert.equal(response.status, HttpStatus.UNAUTHORIZED);
          assert.notEqual(typeof response.body.errors, "undefined");
          assert.notEqual(response.body.errors.length, 0);
        });
    });

    it("requires a correct password", () => {
      const creds = {
        username: "skyler.white",
        password: "p4ssw0rdb0gu5",
      };

      return LoginSerializer.serialize(creds)
        .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
        .then((response) => {
          assert.equal(response.status, HttpStatus.UNAUTHORIZED);
          assert.notEqual(typeof response.body.errors, "undefined");
          assert.notEqual(response.body.errors.length, 0);
        });
    });

    it("succeeds with valid credentials", () => {
      const creds = {
        username: "skyler.white",
        password: "p4ssw0rd",
      };

      return LoginSerializer.serialize(creds)
        .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
        .then((response) => {
          assert.equal(response.status, HttpStatus.OK);
          assert.equal(typeof response.body.errors, "undefined");
        });
    });

    it("returns the user info", () => {
      const creds = {
        username: "skyler.white",
        password: "p4ssw0rd",
      };

      return LoginSerializer.serialize(creds)
        .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
        .then((response) => {
          assert.equal(response.status, HttpStatus.OK);
          assert.notEqual(typeof response.body.data, "undefined");
          assert.equal(response.body.data.type, "users");
          assert.notEqual(typeof response.body.data.id, "undefined");
          assert.equal(response.body.data.attributes.username, creds.username);
        });
    });

    it("returns a token in the response headers", () => {
      const creds = {
        username: "skyler.white",
        password: "p4ssw0rd",
      };

      return LoginSerializer.serialize(creds)
        .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
        .then((response) => {
          assert.equal(response.status, HttpStatus.OK);
          assert.notEqual(typeof response.get(ACCESS_TOKEN_HEADER), "undefined");
          assert.notEqual(response.get(ACCESS_TOKEN_HEADER).length, 0);
        });
    });

    it("can refresh your token", () => {
      const creds = {
        username: "skyler.white",
        password: "p4ssw0rd",
      };

      let originalAccessToken: string;
      let refreshedAccessToken: string;

      return LoginSerializer.serialize(creds)
        .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
        .then((response) => wait(1000, response)) // need `iat` to change for the token to be different
        .then((response) => {
          assert.equal(response.status, HttpStatus.OK);
          originalAccessToken = response.get(ACCESS_TOKEN_HEADER);
          assert.notEqual(typeof originalAccessToken, "undefined");
          return response.get("Set-Cookie");
        })
        .then((cookie) => agent(app).post("/auth/refresh").set("Cookie", cookie).send())
        .then((response) => {
          assert.equal(response.status, HttpStatus.OK);
          refreshedAccessToken = response.get(ACCESS_TOKEN_HEADER);
          assert.notEqual(typeof refreshedAccessToken, "undefined");
          assert.notEqual(originalAccessToken, refreshedAccessToken);
        });
    });

    it("prevents unauthenticated access to certain routes", () => {
      return agent(app).get("/auth/ping").send().expect(HttpStatus.UNAUTHORIZED);
    });

    it("supplies a token you can use to access authenticated routes", () => {
      const creds = {
        username: "skyler.white",
        password: "p4ssw0rd",
      };

      return LoginSerializer.serialize(creds)
        .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
        .then((response) => response.get(ACCESS_TOKEN_HEADER))
        .then((token) => agent(app).get("/auth/ping").set("Authorization", authHeaderForAccessToken(token)).send())
        .then((response) => {
          assert.equal(response.status, HttpStatus.OK);
          assert.equal(response.body.data.attributes.value, "pong");
        });
    });

    it("logging out prevents future refreshes", () => {
      const creds = {
        username: "skyler.white",
        password: "p4ssw0rd",
      };

      return LoginSerializer.serialize(creds)
        .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
        .then((response) => {
          assert.equal(response.status, HttpStatus.OK);
          const cookie = response.get("Set-Cookie"); // normally client has no access to HttpOnly cookie
          return agent(app).delete("/auth").set("Cookie", cookie).send();
        })
        .then((response) => {
          assert.equal(response.status, HttpStatus.NO_CONTENT);
          const cookie = response.get("Set-Cookie"); // normally client has no access to HttpOnly cookie
          return agent(app).post("/auth/refresh").set("Cookie", cookie).send();
        })
        .then((response) => {
          assert.equal(response.status, HttpStatus.UNAUTHORIZED);
        });
    });
  });
});
