import express from "express";
import bodyParser from "body-parser";
import { appDataSource } from "./appDataSource";
import { routes } from "./routes";
import { User } from "./entity/User";
import { parseBool } from "./utils/parsing";
import { createDatabase } from "./setup/createDatabase";

// For now I'm going to handle special script-like cases with environment
// variables if they require the whole stack. In these situations, we may or may
// not want to serve at the end of the process. We could, instead, just do a
// `process.exit()`, but in case there are async things running (like logging,
// possibly) I'd rather not accidentally abort/truncate them. So, we'll control
// that with a flag instead and allow the process to exit gracefully. To set an
// exit code (like with `process.exit(1)`) you can use `process.exitCode = 1`
// instead.
let startServer = true;

console.log("process.env.CREATE_DB:", process.env.CREATE_DB);

if (parseBool(process.env.CREATE_DB)) {
  startServer = false;

  console.log("Creating database.");

  createDatabase().catch((error) => {
    console.error("Encountered an error while creating the database.");
    throw error;
  });
}

if (startServer) {
  appDataSource.initialize().then(async (ds) => {
    // Add some test users (this is lazy and will grow every time you start the
    // server... TODO: be less lazy)
    await ds.manager.save(
      ds.manager.create(User, {
        username: `foobar ${new Date().getTime()}`,
      }),
    );

    await ds.manager.save(
      ds.manager.create(User, {
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

    console.log("Started server.");
  }).catch(error => console.log(error));
}
