import Router from 'express';
import { getDoctor,getDoctorsInUserCity } from '../controller/doctor.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/getDoctor', getDoctor);
router.get('/getDoctorBycity', isAuthenticated,getDoctorsInUserCity);


export default router;
