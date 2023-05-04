import { BaseController } from "./server/controllers/BaseController";
import { UsersController } from "./server/controllers/UserController";

export type HttpMethod = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

export type ControllerAction = "index" | "show" | "create" | "update" | "destroy";

export interface ControllerClass {
  new (...args: any[]): BaseController;
}

export interface RouteDefinition {
  method: HttpMethod;
  route: string;
  controller: { new (...args: any[]): BaseController };
  action: ControllerAction;
}

// TODO: just make these into decorators
export const routes: RouteDefinition[] = [
  {
    method: "get",
    route: "/users",
    controller: UsersController,
    action: "index",
  },
  {
    method: "get",
    route: "/users/:id",
    controller: UsersController,
    action: "show",
  },
  {
    method: "post",
    route: "/users",
    controller: UsersController,
    action: "create",
  },
  {
    method: "patch",
    route: "/users/:id",
    controller: UsersController,
    action: "update",
  },
  {
    method: "put",
    route: "/users/:id",
    controller: UsersController,
    action: "update",
  },
  {
    method: "delete",
    route: "/users/:id",
    controller: UsersController,
    action: "destroy",
  },
];
