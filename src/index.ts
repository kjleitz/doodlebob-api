import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { appDataSource } from "./orm/config/appDataSource";
import { routes } from "./routes";
import { Config } from "./Config";
import { errorHandler } from "./middleware/handlers/errorHandler";

// Init
const app = express();

// Settings
app.set("env", Config.env);

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorHandler);

// Routes
app.get("/ping", (req, res) => res.send("pong"));

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

// Database
appDataSource
  .initialize()
  .then(() => {
    // Run
    app.listen(Config.port);
    console.log(`Server listening on port ${Config.port}`);
  })
  .catch((error) => console.log(error));
