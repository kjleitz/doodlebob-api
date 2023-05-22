import { expect } from "chai";
import "mocha";
import { findLast, sortedUniq, uniq } from "./arrays";

const STRINGS = ["foo", "bar", "baz", "bar", "bam"];
const SORTED_STRINGS = [...STRINGS].sort();
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

const stringifyObjectByKey = <O extends (typeof OBJECTS)[number], F extends keyof O>(obj: O, field: F): string => {
  const val = obj[field];
  return typeof val === "symbol" ? val.toString() : "" + val;
};

const objectSorter = (prev: (typeof OBJECTS)[number], next: (typeof OBJECTS)[number]) => {
  const prevA = stringifyObjectByKey(prev, "a");
  const nextA = stringifyObjectByKey(next, "a");
  if (prevA < nextA) return -1;
  if (prevA > nextA) return 1;
  return 0;
};

const SORTED_OBJECTS_BY_KEY_A = [...OBJECTS].sort(objectSorter);

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

const SORTED_OBJECTS_UNIQUE_BY_KEY_A = [...OBJECTS_UNIQUE_BY_KEY_A].sort(objectSorter);

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

  describe("sortedUniq", () => {
    it("returns unique items from a sorted array", () => {
      expect(SORTED_STRINGS.length).not.to.equal(STRINGS_SET.size);
      expect(sortedUniq(SORTED_STRINGS).length).to.equal(STRINGS_SET.size);
      expect(sortedUniq(SORTED_STRINGS)).to.deep.equal(Array.from(STRINGS_SET).sort());
    });

    it("does not necessarily return unique items from an unsorted array", () => {
      expect(STRINGS.length).not.to.equal(STRINGS_SET.size);
      expect(sortedUniq(STRINGS).length).not.to.equal(STRINGS_SET.size);
      expect(sortedUniq(STRINGS).sort()).not.to.deep.equal(Array.from(STRINGS_SET).sort());
    });

    it("returns unique objects from a sorted array according to the return value of a given callback function", () => {
      expect(SORTED_OBJECTS_BY_KEY_A.length).not.to.equal(SORTED_OBJECTS_UNIQUE_BY_KEY_A.length);
      expect(uniq(SORTED_OBJECTS_BY_KEY_A, ({ a }) => a).length).to.equal(SORTED_OBJECTS_UNIQUE_BY_KEY_A.length);
      expect(uniq(SORTED_OBJECTS_BY_KEY_A, ({ a }) => a)).to.deep.equal(SORTED_OBJECTS_UNIQUE_BY_KEY_A);
    });
  });

  describe("findLast", () => {
    it("returns the last value matched", () => {
      const list = ["a", 1, true, 123, undefined, "b", null, "c", 321];
      const lastString = findLast(list, (value) => typeof value === "string");
      expect(lastString).to.equal("c");
    });

    it("returns undefined if no match is found", () => {
      const list = ["a", 1, true, 123, undefined, "b", null, "c", 321];
      const lastZ = findLast(list, (value) => value === "z");
      expect(lastZ).to.be.undefined;
    });

    it("can return the last element", () => {
      const list = ["a", 1, true, 123, undefined, "b", null, "c"];
      const lastString = findLast(list, (value) => typeof value === "string");
      expect(lastString).to.equal("c");
    });

    it("can return the first element", () => {
      const list = ["a", 1, true, 123, undefined, Symbol("hi"), null, 321];
      const lastString = findLast(list, (value) => typeof value === "string");
      expect(lastString).to.equal("a");
    });
  });
});
