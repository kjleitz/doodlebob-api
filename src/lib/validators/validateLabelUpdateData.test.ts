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
  it("allows not updating the name by leaving it blank", () => {
    expect(() => validateLabelCreateData(attrsMinus("name"))).not.to.throw;
    expect(() => validateLabelCreateData(attrsPlus({ name: undefined }))).not.to.throw;
  });

  it("requires a non-empty name if given", () => {
    expect(() => validateLabelCreateData(attrsPlus({ name: "" }))).to.throw(InvalidInputError, /name/i);
    expect(() => validateLabelCreateData(attrsPlus({ name: null }))).to.throw(InvalidInputError, /name/i);
    expect(() => validateLabelCreateData(attrsPlus({ name: "Foobar" }))).not.to.throw;
  });
});
