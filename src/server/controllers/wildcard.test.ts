import "mocha";
import { agent } from "supertest";
import { app } from "../..";
import HttpStatus from "../../lib/errors/HttpStatus";

describe("Wildcard controller", () => {
  describe("Not found", () => {
    it("returns 404 for a GET request to an unregistered route", () => {
      return agent(app).get("/kjahfkjh").send().expect(HttpStatus.NOT_FOUND);
    });

    it("returns 404 for a POST request to an unregistered route", () => {
      return agent(app).post("/kjahf/jh").send({ some: "data" }).expect(HttpStatus.NOT_FOUND);
    });

    it("returns 404 for a PATCH request to an unregistered route", () => {
      return agent(app).patch("/kjah.fkh").send({ some: "data" }).expect(HttpStatus.NOT_FOUND);
    });

    it("returns 404 for a PUT request to an unregistered route", () => {
      return agent(app).put("/kj/hf/jh").send({ some: "data" }).expect(HttpStatus.NOT_FOUND);
    });

    it("returns 404 for a DELETE request to an unregistered route", () => {
      return agent(app).delete("/kj/hf.jh").send().expect(HttpStatus.NOT_FOUND);
    });

    it("returns 404 for a HEAD request to an unregistered route", () => {
      return agent(app).head("/kj/hf-jh").send().expect(HttpStatus.NOT_FOUND);
    });

    // See https://github.com/expressjs/cors/blob/f038e7722838fd83935674aa8c5bf452766741fb/lib/index.js#L176-L178
    it("returns 204 for an OPTIONS request to an unregistered route, because of browser quirks I guess?", () => {
      return agent(app).options("/kj/hf%20jh").send().expect(HttpStatus.NO_CONTENT);
    });
  });
});
