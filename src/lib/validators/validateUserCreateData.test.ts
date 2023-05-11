import "mocha";
import { expect } from "chai";
import { validateUserCreateData } from "./validateUserCreateData";
import InvalidInputError from "../errors/app/InvalidInputError";
import Role from "../auth/Role";
import UserAdminCreateAttributes from "../permitters/users/UserAdminCreateAttributes";

const VALID_ATTRIBUTES: UserAdminCreateAttributes = {
  // usernames can be anything, including emails
  username: "foobar@blah.com.whatever_dude99-backupACCOUNT+yeah",
  // emails can be anything, including simple alpha strings
  email: "localhost",
  password: "thisisapassword",
  role: Role.ADMIN,
};

const attrsPlus = (additionalAttributes: Record<string, any>): Record<string, any> => ({
  ...VALID_ATTRIBUTES,
  ...additionalAttributes,
});

describe("validateUserCreateData", () => {
  it("allows any email", () => {
    expect(() => validateUserCreateData(attrsPlus({ email: undefined }))).not.to.throw();
    expect(() => validateUserCreateData(attrsPlus({ email: null }))).not.to.throw();
    expect(() => validateUserCreateData(attrsPlus({ email: 123 }))).not.to.throw(); // maybe should at least force string
    expect(() => validateUserCreateData(attrsPlus({ email: true }))).not.to.throw(); // maybe should at least force string
    expect(() => validateUserCreateData(attrsPlus({ email: "" }))).not.to.throw();
    expect(() => validateUserCreateData(attrsPlus({ email: "localhost" }))).not.to.throw();
    expect(() => validateUserCreateData(attrsPlus({ email: "foo bar baz" }))).not.to.throw();
  });

  it("requires a valid username", () => {
    expect(() => validateUserCreateData(attrsPlus({ username: undefined }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserCreateData(attrsPlus({ username: null }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserCreateData(attrsPlus({ username: 123 }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserCreateData(attrsPlus({ username: true }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserCreateData(attrsPlus({ username: "" }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserCreateData(attrsPlus({ username: "foo bar" }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserCreateData(attrsPlus({ username: "foo*bar" }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserCreateData(attrsPlus({ username: "foo/bar" }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserCreateData(attrsPlus({ username: "foo_bar" }))).not.to.throw();
    expect(() => validateUserCreateData(VALID_ATTRIBUTES)).not.to.throw();
  });

  it("requires a valid password", () => {
    expect(() => validateUserCreateData(attrsPlus({ password: undefined }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserCreateData(attrsPlus({ password: null }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserCreateData(attrsPlus({ password: 123 }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserCreateData(attrsPlus({ password: true }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserCreateData(attrsPlus({ password: "" }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserCreateData(attrsPlus({ password: "abcde" }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserCreateData(attrsPlus({ password: "*****" }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserCreateData(attrsPlus({ password: "abcdef" }))).not.to.throw();
    expect(() => validateUserCreateData(attrsPlus({ password: "******" }))).not.to.throw();
  });

  it("requires a valid role if given", () => {
    expect(() => validateUserCreateData(attrsPlus({ role: undefined }))).not.to.throw();
    expect(() => validateUserCreateData(attrsPlus({ role: null }))).not.to.throw();
    expect(() => validateUserCreateData(attrsPlus({ role: Role.ADMIN }))).not.to.throw();
    expect(() => validateUserCreateData(attrsPlus({ role: Role.PEASANT }))).not.to.throw();
    expect(() => validateUserCreateData(attrsPlus({ role: -1 }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: 123 }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: true }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "" + Role.ADMIN }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "" + Role.PEASANT }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "123" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "-1" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "ADMIN" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "Admin" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "admin" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "PEASANT" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "Peasant" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserCreateData(attrsPlus({ role: "peasant" }))).to.throw(InvalidInputError, /role/i);
  });
});
