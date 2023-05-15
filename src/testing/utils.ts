import { SuperAgentTest, agent } from "supertest";
import LoginSerializer from "../lib/serializers/LoginSerializer";
import { app } from "..";
import HttpStatus from "../lib/errors/HttpStatus";
import { ACCESS_TOKEN_HEADER } from "../constants";
import { expect } from "chai";

export function authHeaderForAccessToken(accessToken: string): string {
  return `Bearer ${accessToken}`;
}

export function wait(milliseconds: number): Promise<void>;
export function wait<R>(milliseconds: number, resolveWith: R): Promise<R>;
export function wait<R>(milliseconds: number, resolveWith?: R): Promise<R | void> {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      typeof resolveWith === "undefined" ? resolve() : resolve(resolveWith);
    }, milliseconds);
  });
}

// export const signIn = (username: string, password = "p4ssw0rd"): Promise<{ authed: SuperAgentTest; user: User }> => {
export const signIn = (username: string, password = "p4ssw0rd"): Promise<{ authed: SuperAgentTest; id: string }> => {
  return LoginSerializer.serialize({ username, password })
    .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
    .then((response) => {
      expect(response.status).to.equal(HttpStatus.OK);
      const accessToken = response.get(ACCESS_TOKEN_HEADER);
      const cookie = response.get("Set-Cookie");
      const authed = agent(app);
      authed.set("Cookie", cookie).set("Authorization", authHeaderForAccessToken(accessToken));
      // const user = deserializeToUser(response.body)
      const id = response.body.data.id as string;
      return { authed, id };
    });
};
