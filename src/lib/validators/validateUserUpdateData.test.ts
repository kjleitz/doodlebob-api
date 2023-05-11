import "mocha";
import { expect } from "chai";
import { validateUserUpdateData } from "./validateUserUpdateData";
import InvalidInputError from "../errors/app/InvalidInputError";
import Role from "../auth/Role";
import UserAdminUpdateAttributes from "../permitters/users/UserAdminUpdateAttributes";

const VALID_ATTRIBUTES: UserAdminUpdateAttributes = {
  // usernames can be anything, including emails
  username: "foobar@blah.com.whatever_dude99-backupACCOUNT+yeah",
  // emails can be anything, including simple alpha strings
  email: "localhost",
  newPassword: "thisisapassword",
  oldPassword: "thisisalsoapassword",
  role: Role.ADMIN,
};

const attrsPlus = (additionalAttributes: Record<string, any>): Record<string, any> => ({
  ...VALID_ATTRIBUTES,
  ...additionalAttributes,
});

describe("validateUserUpdateData", () => {
  it("allows any email", () => {
    expect(() => validateUserUpdateData(attrsPlus({ email: undefined }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ email: null }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ email: 123 }))).not.to.throw(); // maybe should at least force string
    expect(() => validateUserUpdateData(attrsPlus({ email: true }))).not.to.throw(); // maybe should at least force string
    expect(() => validateUserUpdateData(attrsPlus({ email: "" }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ email: "localhost" }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ email: "foo bar baz" }))).not.to.throw();
  });

  it("requires a valid username if given", () => {
    expect(() => validateUserUpdateData(attrsPlus({ username: undefined }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ username: null }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ username: 123 }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserUpdateData(attrsPlus({ username: true }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserUpdateData(attrsPlus({ username: "" }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserUpdateData(attrsPlus({ username: "foo bar" }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserUpdateData(attrsPlus({ username: "foo*bar" }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserUpdateData(attrsPlus({ username: "foo/bar" }))).to.throw(InvalidInputError, /username/i);
    expect(() => validateUserUpdateData(attrsPlus({ username: "foo_bar" }))).not.to.throw();
    expect(() => validateUserUpdateData(VALID_ATTRIBUTES)).not.to.throw();
  });

  it("requires a valid newPassword if given", () => {
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: undefined }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: null }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: 123 }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: true }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: "" }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: "abcde" }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: "*****" }))).to.throw(InvalidInputError, /password/i);
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: "abcdef" }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: "******" }))).not.to.throw();
  });

  it("requires a present oldPassword if newPassword is given", () => {
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: undefined, oldPassword: undefined }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: null, oldPassword: null }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: null, oldPassword: "" }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: null, oldPassword: "foobar" }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: "abcdefghijkl", oldPassword: null }))).to.throw(
      InvalidInputError,
      /password/i,
    );
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: "abcdefghijkl", oldPassword: undefined }))).to.throw(
      InvalidInputError,
      /password/i,
    );
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: "abcdefghijkl", oldPassword: "" }))).to.throw(
      InvalidInputError,
      /password/i,
    );
    expect(() => validateUserUpdateData(attrsPlus({ newPassword: "abcdefghijkl", oldPassword: "abc" }))).not.to.throw();
  });

  it("requires a valid role if given", () => {
    expect(() => validateUserUpdateData(attrsPlus({ role: undefined }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ role: null }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ role: Role.ADMIN }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ role: Role.PEASANT }))).not.to.throw();
    expect(() => validateUserUpdateData(attrsPlus({ role: -1 }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: 123 }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: true }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "" + Role.ADMIN }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "" + Role.PEASANT }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "123" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "-1" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "ADMIN" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "Admin" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "admin" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "PEASANT" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "Peasant" }))).to.throw(InvalidInputError, /role/i);
    expect(() => validateUserUpdateData(attrsPlus({ role: "peasant" }))).to.throw(InvalidInputError, /role/i);
  });
});
