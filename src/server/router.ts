import { Router } from "express";
import auth from "./controllers/auth";
import users from "./controllers/users";
import root from "./controllers/root";
import wildcard from "./controllers/wildcard";
import notes from "./controllers/notes";

const router = Router();

router.use("/auth", auth.router);
router.use("/users", users.router);
router.use("/notes", notes.router);

router.use(root.router);
router.use(wildcard.router);

export default router;
