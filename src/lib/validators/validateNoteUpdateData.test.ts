import "mocha";
import { expect } from "chai";
import { validateNoteUpdateData } from "./validateNoteUpdateData";
import InvalidInputError from "../errors/app/InvalidInputError";
import { NoteUpdateAttributes } from "../../server/schemata/jsonApiNotes";

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

describe("validateNoteUpdateData", () => {
  it("allows an empty title", () => {
    expect(() => validateNoteUpdateData(attrsMinus("title"))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ title: "" }))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ title: null }))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ title: undefined }))).not.to.throw;
  });

  it("allows an empty body", () => {
    expect(() => validateNoteUpdateData(attrsMinus("body"))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ body: "" }))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ body: null }))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ body: undefined }))).not.to.throw;
  });

  it("allows an empty title and body", () => {
    expect(() => validateNoteUpdateData({})).not.to.throw;
    expect(() => validateNoteUpdateData(attrsMinus("title", "body"))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ title: "", body: "" }))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ title: null, body: null }))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ title: undefined, body: undefined }))).not.to.throw;
  });

  it("requires some collection of attributes", () => {
    expect(() => validateNoteUpdateData(undefined as unknown as {})).to.throw(InvalidInputError, /attributes/);
    expect(() => validateNoteUpdateData({})).not.to.throw;
  });

  it("requires title to be a string if present", () => {
    expect(() => validateNoteUpdateData(attrsPlus({ title: "foobar" }))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ title: 123 }))).to.throw(InvalidInputError, /title/i);
    expect(() => validateNoteUpdateData(attrsPlus({ title: true }))).to.throw(InvalidInputError, /title/i);
  });

  it("requires body to be a string if present", () => {
    expect(() => validateNoteUpdateData(attrsPlus({ body: "foobar" }))).not.to.throw;
    expect(() => validateNoteUpdateData(attrsPlus({ body: 123 }))).to.throw(InvalidInputError, /body/i);
    expect(() => validateNoteUpdateData(attrsPlus({ body: true }))).to.throw(InvalidInputError, /body/i);
  });
});
