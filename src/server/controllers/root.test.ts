import "mocha";
import { expect } from "chai";
import { agent } from "supertest";
import { app } from "../..";
import HttpStatus from "../../lib/errors/HttpStatus";

describe("Root controller", () => {
  describe("Health checks", () => {
    it("returns successful message when hitting /", () => {
      return agent(app)
        .get("/")
        .send()
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.data.attributes.value).to.equal("Yes?");
        });
    });

    it("returns successful message when hitting /ping", () => {
      return agent(app)
        .get("/ping")
        .send()
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.data.attributes.value).to.equal("pong");
        });
    });

    it("returns successful message when hitting /marco", () => {
      return agent(app)
        .get("/marco")
        .send()
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.data.attributes.value).to.equal("polo");
        });
    });

    it("returns successful message when hitting /healthCheck", () => {
      return agent(app)
        .get("/healthCheck")
        .send()
        .then((response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.data.attributes.value).to.equal("SUCCESS");
        });
    });
  });
});
