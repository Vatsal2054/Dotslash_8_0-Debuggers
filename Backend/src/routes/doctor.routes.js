import Router from 'express';
import { getDoctor } from '../controller/doctor.controller.js';

const router = Router();

router.get('/getDoctor', getDoctor);
router.ger('/getDoctorBycity', getDoctorsInUserCity);


export default router;
