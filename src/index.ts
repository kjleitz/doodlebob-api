import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import Config from "./Config";
import createRotatingLogStream from "./lib/logging/createRotatingLogStream";
import appDataSource from "./orm/config/appDataSource";
import errorHandler from "./server/middleware/handlers/errorHandler";
import setJwtUserClaims from "./server/middleware/prep/setJwtUserClaims";
import router from "./server/router";
import setDocument from "./server/middleware/prep/setDocument";
import setPage from "./server/middleware/prep/setPage";
import setFilter from "./server/middleware/prep/setFilter";
import setSort from "./server/middleware/prep/setSort";

// Init
export const app = express();

// Settings
app.set("env", Config.env);
// app.set("query parser", "extended");

// Pre-route middleware
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(setJwtUserClaims);
app.use(setDocument);
app.use(setPage);
app.use(setFilter);
app.use(setSort);

// Logging
const accessLogStream = createRotatingLogStream(`doodlebob-access-${Config.env}.log`);
app.use(morgan("combined", { stream: accessLogStream }));
if (Config.isDev) app.use(morgan("dev")); // also print nicely colored logs to stdout

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
