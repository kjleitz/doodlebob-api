import { Response, SuperAgentTest, agent } from "supertest";
import LoginSerializer from "../lib/serializers/LoginSerializer";
import { app } from "..";
import HttpStatus from "../lib/errors/HttpStatus";
import { ACCESS_TOKEN_HEADER } from "../constants";
import { expect } from "chai";
import { toJson } from "../lib/utils/strings";

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

export const signIn = (username: string, password = "p4ssw0rd"): Promise<{ authed: SuperAgentTest; id: string }> => {
  return LoginSerializer.serialize({ username, password })
    .then((serialized) => agent(app).post("/auth/signIn").send(serialized))
    .then((response) => {
      expect(response.status).to.equal(HttpStatus.OK);
      const accessToken = response.get(ACCESS_TOKEN_HEADER);
      const cookie = response.get("Set-Cookie");
      const authed = agent(app);
      authed.set("Cookie", cookie).set("Authorization", authHeaderForAccessToken(accessToken));
      const id = response.body.data.id as string;
      return { authed, id };
    });
};

// Insert in promise chain after making a request to log any errors if they occurred
export const printResponseErrorsMiddleman = (response: Response): Response => {
  const { errors } = response.body;
  const originalDetail = errors?.[0]?.meta?.original?.errors?.[0]?.detail as string | undefined;
  const originalDetailProjectOnly = originalDetail
    ?.split("\n")
    .filter((line: string) => !line.includes("node_modules"))
    .join("\n");
  if (errors) console.error("\nHTTP error:\n", JSON.stringify(errors, null, 2));
  if (originalDetail) console.error("\nOriginal error:\n", originalDetail);
  if (originalDetailProjectOnly)
    console.error("\nOriginal error (filtered for project files):\n", originalDetailProjectOnly);
  return response;
};

// Insert in promise chain after making a request to log the [serialized] response body
export const printResponseBodyMiddleman = (response: Response): Response => {
  console.log(toJson(response.body));
  return response;
};

export const printMiddleman = <T>(resolvedValue: T): T => {
  console.log(resolvedValue);
  return resolvedValue;
};

export const printJsonMiddleman = <T>(resolvedValue: T): T => {
  console.log(JSON.stringify(resolvedValue, null, 2));
  return resolvedValue;
};
