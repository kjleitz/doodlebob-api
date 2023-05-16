import { Router } from "express";
import auth from "./controllers/auth";
import labels from "./controllers/labels";
import notes from "./controllers/notes";
import root from "./controllers/root";
import users from "./controllers/users";
import wildcard from "./controllers/wildcard";

const router = Router();

router.use("/auth", auth.router);
router.use("/labels", labels.router);
router.use("/notes", notes.router);
router.use("/users", users.router);

router.use(root.router);
router.use(wildcard.router);

export default router;
