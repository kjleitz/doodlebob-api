import { expect } from "chai";
import "mocha";
import orderFromSortOptions from "./orderFromSortOptions";
import SortOptions, { SortDirection, SortOrder } from "./SortOptions";

interface JustFoo {
  foo: string;
}

interface FooAndBar {
  foo: string;
  bar: string;
}

const EMPTY_SORT_OPTIONS: SortOptions<JustFoo> = [];
const PARTIAL_SORT_OPTIONS: SortOptions<FooAndBar> = [{ field: "bar", direction: SortDirection.FORWARD }];
const FULL_SORT_OPTIONS: SortOptions<FooAndBar> = [
  { field: "bar", direction: SortDirection.FORWARD },
  { field: "foo", direction: SortDirection.REVERSE },
];

describe("orderFromSortOptions", () => {
  it("returns a default sort order as given", () => {
    const order1 = orderFromSortOptions(EMPTY_SORT_OPTIONS, "foo", { foo: SortOrder.ASC });
    expect(order1.foo).to.equal(SortOrder.ASC);

    const order2 = orderFromSortOptions(EMPTY_SORT_OPTIONS, "foo", { foo: SortOrder.DESC });
    expect(order2.foo).to.equal(SortOrder.DESC);
  });

  it("filters out fields with no given defaults", () => {
    const hasBar = PARTIAL_SORT_OPTIONS.some(({ field }) => field === "bar");
    expect(hasBar).to.be.true;

    const hasFoo = PARTIAL_SORT_OPTIONS.some(({ field }) => field === "foo");
    expect(hasFoo).to.be.false;

    const order1 = orderFromSortOptions(PARTIAL_SORT_OPTIONS, "foo", { foo: SortOrder.ASC });
    expect(order1.bar).to.be.undefined;
    expect(order1.foo).to.equal(SortOrder.ASC);

    const order2 = orderFromSortOptions(FULL_SORT_OPTIONS, "foo", { foo: SortOrder.ASC });
    expect(order2.bar).to.be.undefined;
    expect(order2.foo).to.equal(SortOrder.DESC);
  });

  it("returns a properly-constructed object containing the sort fields matched with the correct sort order", () => {
    const hasFoo = FULL_SORT_OPTIONS.some(({ field }) => field === "foo");
    expect(hasFoo).to.be.true;

    const hasBar = FULL_SORT_OPTIONS.some(({ field }) => field === "bar");
    expect(hasBar).to.be.true;

    const order1 = orderFromSortOptions(FULL_SORT_OPTIONS, "foo", { foo: SortOrder.ASC });
    expect(order1.bar).to.be.undefined;
    expect(order1.foo).to.equal(SortOrder.DESC);

    const order2 = orderFromSortOptions(FULL_SORT_OPTIONS, "foo", { foo: SortOrder.ASC, bar: SortOrder.ASC });
    expect(order2.bar).to.equal(SortOrder.ASC);
    expect(order2.foo).to.equal(SortOrder.DESC);

    const order3 = orderFromSortOptions(FULL_SORT_OPTIONS, "bar", { foo: SortOrder.ASC, bar: SortOrder.ASC });
    expect(order3.bar).to.equal(SortOrder.ASC);
    expect(order3.foo).to.equal(SortOrder.DESC);

    const order4 = orderFromSortOptions(FULL_SORT_OPTIONS, "foo", { foo: SortOrder.DESC, bar: SortOrder.DESC });
    expect(order4.bar).to.equal(SortOrder.DESC);
    expect(order4.foo).to.equal(SortOrder.ASC);

    const order5 = orderFromSortOptions(FULL_SORT_OPTIONS, "bar", { foo: SortOrder.DESC, bar: SortOrder.DESC });
    expect(order5.bar).to.equal(SortOrder.DESC);
    expect(order5.foo).to.equal(SortOrder.ASC);
  });
});
