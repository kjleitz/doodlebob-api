import { after, before, describe, it } from "node:test";
import { Response, agent } from "supertest";
import { app } from "../..";
import LoginSerializer from "../../lib/serializers/LoginSerializer";
import assert from "node:assert";
import HttpStatus from "../../lib/errors/HttpStatus";
import appDataSource from "../../orm/config/appDataSource";

describe("Sign-in", () => {
  before(() => {
    return appDataSource.initialize();
  });

  after(() => {
    return appDataSource.destroy();
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

  // it("returns a token in the response headers", () => {
  //   const creds = {
  //     username: "skyler.white",
  //     password: "p4ssw0rd",
  //   };

  //   return LoginSerializer.serialize(creds)
  //     .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
  //     .then((response) => {
  //       assert.equal(response.status, HttpStatus.OK);
  //       assert.notEqual(response.body.errors.length, 0);
  //     });
  // });
});

declare const foo: Response;
