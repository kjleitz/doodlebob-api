import "mocha";
import { expect } from "chai";
import { validateLabelCreateData } from "./validateLabelCreateData";
import InvalidInputError from "../errors/app/InvalidInputError";
import LabelCreateAttributes from "../permitters/labels/LabelCreateAttributes";

const VALID_ATTRIBUTES: LabelCreateAttributes = {
  name: "Foobar",
};

const attrsPlus = (additionalAttributes: Record<string, any>): Record<string, any> => ({
  ...VALID_ATTRIBUTES,
  ...additionalAttributes,
});

const attrsMinus = (...subtractionalAttributes: (keyof LabelCreateAttributes)[]): Record<string, any> => {
  const newAttrs = { ...VALID_ATTRIBUTES };
  subtractionalAttributes.forEach((attr) => delete newAttrs[attr]);
  return newAttrs;
};

describe("validateLabelCreateData", () => {
  it("requires a non-empty name", () => {
    expect(() => validateLabelCreateData(attrsMinus("name"))).to.throw(InvalidInputError, /name/i);
    expect(() => validateLabelCreateData(attrsPlus({ name: "" }))).to.throw(InvalidInputError, /name/i);
    expect(() => validateLabelCreateData(attrsPlus({ name: null }))).to.throw(InvalidInputError, /name/i);
    expect(() => validateLabelCreateData(attrsPlus({ name: undefined }))).to.throw(InvalidInputError, /name/i);
    expect(() => validateLabelCreateData(attrsPlus({ name: "Foobar" }))).not.to.throw;
  });
});
