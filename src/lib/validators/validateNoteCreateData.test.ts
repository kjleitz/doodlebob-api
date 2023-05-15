import "mocha";
import { expect } from "chai";
import { validateNoteCreateData } from "./validateNoteCreateData";
import InvalidInputError from "../errors/app/InvalidInputError";
import NoteCreateAttributes from "../permitters/notes/NoteCreateAttributes";

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

describe("validateNoteCreateData", () => {
  it("allows an empty title", () => {
    expect(() => validateNoteCreateData(attrsMinus("title"))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ title: "" }))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ title: null }))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ title: undefined }))).not.to.throw;
  });

  it("allows an empty body", () => {
    expect(() => validateNoteCreateData(attrsMinus("body"))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ body: "" }))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ body: null }))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ body: undefined }))).not.to.throw;
  });

  it("allows an empty title and body", () => {
    expect(() => validateNoteCreateData({})).not.to.throw;
    expect(() => validateNoteCreateData(attrsMinus("title", "body"))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ title: "", body: "" }))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ title: null, body: null }))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ title: undefined, body: undefined }))).not.to.throw;
  });

  it("requires some collection of attributes", () => {
    expect(() => validateNoteCreateData(undefined as unknown as {})).to.throw(InvalidInputError, /attributes/);
    expect(() => validateNoteCreateData({})).not.to.throw;
  });

  it("requires title to be a string if present", () => {
    expect(() => validateNoteCreateData(attrsPlus({ title: "foobar" }))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ title: 123 }))).to.throw(InvalidInputError, /title/i);
    expect(() => validateNoteCreateData(attrsPlus({ title: true }))).to.throw(InvalidInputError, /title/i);
  });

  it("requires body to be a string if present", () => {
    expect(() => validateNoteCreateData(attrsPlus({ body: "foobar" }))).not.to.throw;
    expect(() => validateNoteCreateData(attrsPlus({ body: 123 }))).to.throw(InvalidInputError, /body/i);
    expect(() => validateNoteCreateData(attrsPlus({ body: true }))).to.throw(InvalidInputError, /body/i);
  });
});
