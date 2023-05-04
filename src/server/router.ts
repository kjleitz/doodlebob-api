import { Router } from "express";
import users from "./controllers/users";
import root from "./controllers/root";
import wildcard from "./controllers/wildcard";

const router = Router();

router.use("/users", users.router);

router.use(root.router);
router.use(wildcard.router);

export default router;
