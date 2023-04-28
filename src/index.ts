import express from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "./data-source";
import { routes } from "./routes";
import { User } from "./entity/User";

AppDataSource.initialize().then(async (_dataSource) => {
  // Add some test users (this is lazy and will grow every time you start the
  // server... TODO: be less lazy)
  await AppDataSource.manager.save(
    AppDataSource.manager.create(User, {
      username: `foobar ${new Date().getTime()}`,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(User, {
      username: `barbaz ${new Date().getTime()}`,
    }),
  );

  // Create app and add middleware
  const app = express();
  app.set("env", process.env.APP_ENV ?? "development");
  app.use(bodyParser.json());

  app.get("/ping", (req, res) => res.send("pong"));

  // Register routes
  routes.forEach(({ method, route, controller, action }) => {
    app[method](route, (req, res, next) => {
      const controllerInstance = new controller();
      const result = controllerInstance[action](req, res, next);

      Promise.resolve(result).then((value) => {
        if (value === null || typeof value === "undefined") return;

        res.json(value);
      });
    });
  });

  // Start server
  app.listen(3000);

  console.log("Started!");
}).catch(error => console.log(error));
