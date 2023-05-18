import "mocha";
import { uniq } from "./arrays";
import { expect } from "chai";
import { middleman } from "./promises";

describe("Promises utils", () => {
  describe("middleman", () => {
    it("does not interrupt the promise chain", () => {
      return Promise.resolve(123)
        .then((n) => n + 7)
        .then(middleman(() => void 0))
        .then((n) => expect(n).to.equal(130));
    });

    it("receives the resolved value as an argument", () => {
      return Promise.resolve(123)
        .then((n) => n + 7)
        .then(middleman((n) => expect(n).to.equal(130)))
        .then((n) => expect(n).to.equal(130));
    });

    it("does not affect subsequent resolved values with its own return value", () => {
      return Promise.resolve(123)
        .then((n) => n + 7)
        .then(middleman(() => 999))
        .then((n) => expect(n).to.equal(130));
    });

    it("resolves arguments which return promises", () => {
      let resolved = false;

      return Promise.resolve(123)
        .then((n) => n + 7)
        .then(
          middleman(() =>
            Promise.resolve().then(() => {
              resolved = true;
            }),
          ),
        )
        .then((n) => expect(n).to.equal(130));
    });

    it("resolves promise arguments", () => {
      let resolved = false;

      return Promise.resolve(123)
        .then((n) => n + 7)
        .then(
          middleman(
            Promise.resolve().then(() => {
              resolved = true;
            }),
          ),
        )
        .then((n) => expect(n).to.equal(130));
    });

    it("resolves arguments which return promises before resolving itself", () => {
      let step = 1;

      return Promise.resolve(123)
        .then((n) => n + 7)
        .then(
          middleman(
            () =>
              new Promise<void>((resolve, _reject) => {
                expect(step).to.equal(1);
                step = 2;

                setTimeout(() => {
                  expect(step).to.equal(2);
                  step = 3;

                  resolve();
                }, 50);
              }),
          ),
        )
        .then((n) => {
          expect(step).to.equal(3);
          expect(n).to.equal(130);
        });
    });

    it("resolves promise arguments before resolving itself", () => {
      let step = 1;

      return Promise.resolve(123)
        .then((n) => n + 7)
        .then(
          middleman(
            new Promise<void>((resolve, _reject) => {
              expect(step).to.equal(1);
              step = 2;

              setTimeout(() => {
                expect(step).to.equal(2);
                step = 3;

                resolve();
              }, 50);
            }),
          ),
        )
        .then((n) => {
          expect(step).to.equal(3);
          expect(n).to.equal(130);
        });
    });
  });
});
