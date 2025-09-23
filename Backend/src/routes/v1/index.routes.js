import express from "express";

import user from "./auth.routes.js";
import message from "./message.routes.js";
import project from "./project.routes.js";
import ai from "./ai.routes.js";
import execution from "./execution.routes.js";

const router = express.Router();

router.use("/messages", message);
router.use("/users", user);
router.use("/projects", project);
router.use("/ai", ai);
router.use("/execution", execution);

export default router;
