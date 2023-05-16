import "mocha";
import { uniq } from "./arrays";
import { expect } from "chai";

const STRINGS = ["foo", "bar", "baz", "bar", "bam"];
const STRINGS_SET = new Set(STRINGS);

const OBJECTS = [
  /* 0 */ { a: "A" },
  /* 1 */ { b: 123 },
  /* 2 */ { a: true },
  /* 3 */ { a: "ABC" },
  /* 4 */ { a: "A" },
  /* 5 */ { a: 321 },
  /* 6 */ { b: null },
  /* 7 */ { a: "A", b: "hi" },
  /* 8 */ { a: Symbol() },
];
const OBJECTS_UNIQUE_BY_KEY_A = [
  OBJECTS[0],
  OBJECTS[1],
  OBJECTS[2],
  OBJECTS[3],
  // OBJECTS[4], // nope
  OBJECTS[5],
  // OBJECTS[6], // nope
  // OBJECTS[7], // nope
  OBJECTS[8],
];

describe("Arrays utils", () => {
  describe("uniq", () => {
    it("returns unique items from an array", () => {
      expect(STRINGS.length).not.to.equal(STRINGS_SET.size);
      expect(uniq(STRINGS).length).to.equal(STRINGS_SET.size);
      expect(uniq(STRINGS).sort()).to.deep.equal(Array.from(STRINGS_SET).sort());
    });

    it("returns unique objects from an array according to the return value of a given callback function", () => {
      expect(OBJECTS.length).not.to.equal(OBJECTS_UNIQUE_BY_KEY_A.length);
      expect(uniq(OBJECTS, ({ a }) => a).length).to.equal(OBJECTS_UNIQUE_BY_KEY_A.length);
      expect(uniq(OBJECTS, ({ a }) => a)).to.deep.equal(OBJECTS_UNIQUE_BY_KEY_A);
    });
  });
});
