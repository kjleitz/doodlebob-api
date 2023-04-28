import { BaseController } from "./controller/BaseController";
import { UserController } from "./controller/UserController";

export type HttpMethod = "all"
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "options"
  | "head";

export type ControllerAction = "index"
  | "show"
  | "create"
  | "update"
  | "destroy";

export interface ControllerClass {
  new(...args: any[]): BaseController;
}

export interface RouteDefinition {
  method: HttpMethod,
  route: string,
  controller: { new(): BaseController },
  action: ControllerAction,
}

// TODO: just make these into decorators
export const routes: RouteDefinition[] = [
  {
    method: "get",
    route: "/users",
    controller: UserController,
    action: "index",
  }, {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "show",
  }, {
    method: "post",
    route: "/users",
    controller: UserController,
    action: "create",
  }, {
    method: "patch",
    route: "/users/:id",
    controller: UserController,
    action: "update",
  }, {
    method: "put",
    route: "/users/:id",
    controller: UserController,
    action: "update",
  }, {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "destroy",
  },
];
