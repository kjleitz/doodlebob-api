import { expect } from "chai";
import "mocha";
import { ZodError } from "zod";
import { LabelCreateAttributes, LabelUpdateAttributes } from "../../server/schemata/jsonApiLabels";

describe("jsonApiLabels", () => {
  describe("LabelCreateAttributes", () => {
    const VALID_ATTRIBUTES: LabelCreateAttributes = {
      name: "Foobar",
    };

    const attrsPlus = (additionalAttributes: Record<string, any>): Record<string, any> => ({
      ...VALID_ATTRIBUTES,
      ...additionalAttributes,
    });

    const attrsMinus = (...subtractionalAttributes: (keyof LabelCreateAttributes)[]): Record<string, any> => {
      const newAttrs: Partial<LabelCreateAttributes> = { ...VALID_ATTRIBUTES };
      subtractionalAttributes.forEach((attr) => delete newAttrs[attr]);
      return newAttrs;
    };

    it("requires a non-empty name", () => {
      expect(() => LabelCreateAttributes.parse(attrsMinus("name"))).to.throw(ZodError, /name/i);
      expect(() => LabelCreateAttributes.parse(attrsPlus({ name: "" }))).to.throw(ZodError, /name/i);
      expect(() => LabelCreateAttributes.parse(attrsPlus({ name: null }))).to.throw(ZodError, /name/i);
      expect(() => LabelCreateAttributes.parse(attrsPlus({ name: undefined }))).to.throw(ZodError, /name/i);
      expect(() => LabelCreateAttributes.parse(attrsPlus({ name: "Foobar" }))).not.to.throw;
    });
  });

  describe("LabelUpdateAttributes", () => {
    const VALID_ATTRIBUTES: LabelUpdateAttributes = {
      name: "Foobar",
    };

    const attrsPlus = (additionalAttributes: Record<string, any>): Record<string, any> => ({
      ...VALID_ATTRIBUTES,
      ...additionalAttributes,
    });

    const attrsMinus = (...subtractionalAttributes: (keyof LabelUpdateAttributes)[]): Record<string, any> => {
      const newAttrs: Partial<LabelUpdateAttributes> = { ...VALID_ATTRIBUTES };
      subtractionalAttributes.forEach((attr) => delete newAttrs[attr]);
      return newAttrs;
    };

    it("allows not updating the name by leaving it blank", () => {
      expect(() => LabelUpdateAttributes.parse(attrsMinus("name"))).not.to.throw;
      expect(() => LabelUpdateAttributes.parse(attrsPlus({ name: undefined }))).not.to.throw;
    });

    it("requires a non-empty name if given", () => {
      expect(() => LabelUpdateAttributes.parse(attrsPlus({ name: "" }))).to.throw(ZodError, /name/i);
      expect(() => LabelUpdateAttributes.parse(attrsPlus({ name: null }))).to.throw(ZodError, /name/i);
      expect(() => LabelUpdateAttributes.parse(attrsPlus({ name: "Foobar" }))).not.to.throw;
    });
  });
});
