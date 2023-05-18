import { expect } from "chai";
import "mocha";
import { ZodError } from "zod";
import { UserAdminCreateAttributes, UserAdminUpdateAttributes } from "../../server/schemata/jsonApiUsers";
import Role from "../../lib/auth/Role";

describe("jsonApiUsers", () => {
  describe("UserAdminCreateAttributes", () => {
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

    it("allows any email, optionally", () => {
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ email: 123 }))).to.throw(ZodError, /email/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ email: true }))).to.throw(ZodError, /email/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ email: null }))).to.throw(ZodError, /email/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ email: undefined }))).not.to.throw();
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ email: "" }))).not.to.throw();
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ email: "localhost" }))).not.to.throw();
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ email: "foo bar baz" }))).not.to.throw();
    });

    it("requires a valid username", () => {
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ username: undefined }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ username: null }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ username: 123 }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ username: true }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ username: "" }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ username: "foo bar" }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ username: "foo*bar" }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ username: "foo/bar" }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ username: "foo_bar" }))).not.to.throw();
      expect(() => UserAdminCreateAttributes.parse(VALID_ATTRIBUTES)).not.to.throw();
    });

    it("requires a valid password", () => {
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ password: undefined }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ password: null }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ password: 123 }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ password: true }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ password: "" }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ password: "abcde" }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ password: "*****" }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ password: "abcdef" }))).not.to.throw();
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ password: "******" }))).not.to.throw();
    });

    it("requires a valid role if given", () => {
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: undefined }))).not.to.throw();
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: Role.ADMIN }))).not.to.throw();
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: Role.PEASANT }))).not.to.throw();
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: null }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: -1 }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: 123 }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: true }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "" + Role.ADMIN }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "" + Role.PEASANT }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "123" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "-1" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "ADMIN" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "Admin" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "admin" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "PEASANT" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "Peasant" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminCreateAttributes.parse(attrsPlus({ role: "peasant" }))).to.throw(ZodError, /role/i);
    });
  });

  describe("UserAdminUpdateAttributes", () => {
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

    it("allows any email, optionally", () => {
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ email: 123 }))).to.throw(ZodError, /email/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ email: true }))).to.throw(ZodError, /email/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ email: null }))).to.throw(ZodError, /email/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ email: undefined }))).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ email: "" }))).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ email: "localhost" }))).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ email: "foo bar baz" }))).not.to.throw();
    });

    it("requires a valid username if given", () => {
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ username: undefined }))).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ username: null }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ username: 123 }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ username: true }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ username: "" }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ username: "foo bar" }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ username: "foo*bar" }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ username: "foo/bar" }))).to.throw(ZodError, /username/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ username: "foo_bar" }))).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(VALID_ATTRIBUTES)).not.to.throw();
    });

    it("requires a valid newPassword if given", () => {
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: undefined }))).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: null }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: 123 }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: true }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: "" }))).to.throw(ZodError, /password/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: "abcde" }))).to.throw(
        ZodError,
        /password/i,
      );
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: "*****" }))).to.throw(
        ZodError,
        /password/i,
      );
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: "abcdef" }))).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: "******" }))).not.to.throw();
    });

    it("requires a present oldPassword if newPassword is given", () => {
      expect(() =>
        UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: undefined, oldPassword: undefined })),
      ).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: null, oldPassword: null }))).to.throw(
        ZodError,
        /password/i,
      );
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: null, oldPassword: "" }))).to.throw(
        ZodError,
        /password/i,
      );
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: null, oldPassword: "foobar" }))).to.throw(
        ZodError,
        /password/i,
      );
      expect(() =>
        UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: "abcdefghijkl", oldPassword: null })),
      ).to.throw(ZodError, /password/i);
      expect(() =>
        UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: "abcdefghijkl", oldPassword: undefined })),
      ).to.throw(ZodError, /password/i);
      expect(() =>
        UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: "abcdefghijkl", oldPassword: "" })),
      ).to.throw(ZodError, /password/i);
      expect(() =>
        UserAdminUpdateAttributes.parse(attrsPlus({ newPassword: "abcdefghijkl", oldPassword: "abc" })),
      ).not.to.throw();
    });

    it("requires a valid role if given", () => {
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: undefined }))).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: Role.ADMIN }))).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: Role.PEASANT }))).not.to.throw();
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: null }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: -1 }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: 123 }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: true }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "" + Role.ADMIN }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "" + Role.PEASANT }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "123" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "-1" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "ADMIN" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "Admin" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "admin" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "PEASANT" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "Peasant" }))).to.throw(ZodError, /role/i);
      expect(() => UserAdminUpdateAttributes.parse(attrsPlus({ role: "peasant" }))).to.throw(ZodError, /role/i);
    });
  });
});
