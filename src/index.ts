import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import appDataSource from "./orm/config/appDataSource";
import Config from "./Config";
import errorHandler from "./server/middleware/handlers/errorHandler";
import router from "./server/router";
import setJwtUserClaims from "./server/middleware/prep/setJwtUserClaims";

// Init
export const app = express();

// Settings
app.set("env", Config.env);

// Pre-route middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(setJwtUserClaims);

// Routes
app.use("/", router);

// Post-route middleware
app.use(errorHandler);

if (require.main === module) {
  // Database
  appDataSource
    .initialize()
    .then(() => {
      // Run
      app.listen(Config.port);
      console.log(`Server listening on port ${Config.port}`);
    })
    .catch((error) => console.log(error));
}
