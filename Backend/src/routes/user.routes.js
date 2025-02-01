import { Router } from "express";

import { createUser, getUser, logout } from "../controller/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", createUser);

router.get("/login", getUser);

router.get("/logout", isAuthenticated, logout);

export default router;
