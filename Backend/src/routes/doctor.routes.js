import Router from "express";
import {
  dashboard,
  getDoctor,
  getDoctorsInUserCity,
} from "../controller/doctor.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { isDoctor } from "../utils/helper.js";

const router = Router();

router.get("/getDoctor", getDoctor);
router.get("/getDoctorBycity", isAuthenticated, getDoctorsInUserCity);
router.get("/", isAuthenticated, isDoctor, dashboard);

export default router;
