import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { newPrescription,getAllPrescriptionsForUser,getAllPrescriptionsByDoctor } from "../controller/prescription.controller.js";

const router = Router();

router.post("/newPrescription",newPrescription);

router.get("/getAllPrescriptionsForUser",isAuthenticated,getAllPrescriptionsForUser);

router.get("/getAllPrescriptionsByDoctor",isAuthenticated,getAllPrescriptionsByDoctor);




export default router;