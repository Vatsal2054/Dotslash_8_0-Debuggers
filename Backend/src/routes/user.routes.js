import { Router } from "express";

import { createUser, getUser,logout } from "../controller/user.controller.js";

const router = Router();

router.post("/register", createUser);

router.get("/login", getUser);

router.get("/logout", logout);

export default router;
