import { expect } from "chai";
import "mocha";
import { ZodError } from "zod";
import { NoteCreateAttributes, NoteUpdateAttributes } from "../../server/schemata/jsonApiNotes";

describe("jsonApiNotes", () => {
  describe("NoteCreateAttributes", () => {
    const VALID_ATTRIBUTES: NoteCreateAttributes = {
      title: "foobar",
      body: "barbaz",
    };

    const attrsPlus = (additionalAttributes: Record<string, any>): Record<string, any> => ({
      ...VALID_ATTRIBUTES,
      ...additionalAttributes,
    });

    const attrsMinus = (...subtractionalAttributes: (keyof NoteCreateAttributes)[]): Record<string, any> => {
      const newAttrs = { ...VALID_ATTRIBUTES };
      subtractionalAttributes.forEach((attr) => delete newAttrs[attr]);
      return newAttrs;
    };

    it("allows an empty title", () => {
      expect(() => NoteCreateAttributes.parse(attrsMinus("title"))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ title: "" }))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ title: null }))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ title: undefined }))).not.to.throw;
    });

    it("allows an empty body", () => {
      expect(() => NoteCreateAttributes.parse(attrsMinus("body"))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ body: "" }))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ body: null }))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ body: undefined }))).not.to.throw;
    });

    it("allows an empty title and body", () => {
      expect(() => NoteCreateAttributes.parse({})).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsMinus("title", "body"))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ title: "", body: "" }))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ title: null, body: null }))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ title: undefined, body: undefined }))).not.to.throw;
    });

    it("requires some collection of attributes", () => {
      expect(() => NoteCreateAttributes.parse(undefined as unknown as {})).to.throw(ZodError, /required/i);
      expect(() => NoteCreateAttributes.parse({})).not.to.throw;
    });

    it("requires title to be a string if present", () => {
      expect(() => NoteCreateAttributes.parse(attrsPlus({ title: "foobar" }))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ title: 123 }))).to.throw(ZodError, /title/i);
      expect(() => NoteCreateAttributes.parse(attrsPlus({ title: true }))).to.throw(ZodError, /title/i);
    });

    it("requires body to be a string if present", () => {
      expect(() => NoteCreateAttributes.parse(attrsPlus({ body: "foobar" }))).not.to.throw;
      expect(() => NoteCreateAttributes.parse(attrsPlus({ body: 123 }))).to.throw(ZodError, /body/i);
      expect(() => NoteCreateAttributes.parse(attrsPlus({ body: true }))).to.throw(ZodError, /body/i);
    });
  });

  describe("NoteUpdateAttributes", () => {
    const VALID_ATTRIBUTES: NoteUpdateAttributes = {
      title: "foobar",
      body: "barbaz",
    };

    const attrsPlus = (additionalAttributes: Record<string, any>): Record<string, any> => ({
      ...VALID_ATTRIBUTES,
      ...additionalAttributes,
    });

    const attrsMinus = (...subtractionalAttributes: (keyof NoteUpdateAttributes)[]): Record<string, any> => {
      const newAttrs = { ...VALID_ATTRIBUTES };
      subtractionalAttributes.forEach((attr) => delete newAttrs[attr]);
      return newAttrs;
    };

    it("allows an empty title", () => {
      expect(() => NoteUpdateAttributes.parse(attrsMinus("title"))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ title: "" }))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ title: null }))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ title: undefined }))).not.to.throw;
    });

    it("allows an empty body", () => {
      expect(() => NoteUpdateAttributes.parse(attrsMinus("body"))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ body: "" }))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ body: null }))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ body: undefined }))).not.to.throw;
    });

    it("allows an empty title and body", () => {
      expect(() => NoteUpdateAttributes.parse({})).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsMinus("title", "body"))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ title: "", body: "" }))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ title: null, body: null }))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ title: undefined, body: undefined }))).not.to.throw;
    });

    it("requires some collection of attributes", () => {
      expect(() => NoteUpdateAttributes.parse(undefined as unknown as {})).to.throw(ZodError, /required/i);
      expect(() => NoteUpdateAttributes.parse({})).not.to.throw;
    });

    it("requires title to be a string if present", () => {
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ title: "foobar" }))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ title: 123 }))).to.throw(ZodError, /title/i);
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ title: true }))).to.throw(ZodError, /title/i);
    });

    it("requires body to be a string if present", () => {
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ body: "foobar" }))).not.to.throw;
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ body: 123 }))).to.throw(ZodError, /body/i);
      expect(() => NoteUpdateAttributes.parse(attrsPlus({ body: true }))).to.throw(ZodError, /body/i);
    });
  });
});
