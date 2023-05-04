import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { appDataSource } from "./orm/config/appDataSource";
import { routes } from "./routes";
import { Config } from "./Config";
import { errorHandler } from "./server/middleware/handlers/errorHandler";
import { DoodlebobEntity, serializeData, serializeEntities, serializeEntity } from "./lib/serializers/serializeEntity";
import { UnrecognizedEntityError } from "./lib/errors/app/UnrecognizedEntityError";

// Init
const app = express();

// Settings
app.set("env", Config.env);

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get("/ping", (req, res) => res.send("pong"));

routes.forEach(({ method, route, controller, action }) => {
  app[method](route, (req, res, next) => {
    const controllerInstance = new controller();
    let result;
    try {
      result = controllerInstance[action](req, res, next);
    } catch (e) {
      return next(e);
    }

    return Promise.resolve(result)
      .then((value) => {
        if ((value === null || typeof value === "undefined") && res.headersSent) return;

        if (value && typeof (value as any).jsonapi === "object") return res.json(value);

        const serialization = Array.isArray(value)
          ? serializeEntities(value)
          : serializeEntity(value as DoodlebobEntity);

        return serialization
          .catch((e) => {
            if (e instanceof UnrecognizedEntityError) return serializeData(value);
            throw e;
          })
          .then((serialized) => res.json(serialized));
      })
      .catch((e) => next(e));
  });
});

app.use(errorHandler);

// Database
appDataSource
  .initialize()
  .then(() => {
    // Run
    app.listen(Config.port);
    console.log(`Server listening on port ${Config.port}`);
  })
  .catch((error) => console.log(error));
