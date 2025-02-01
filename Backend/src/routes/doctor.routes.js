import Router from 'express';
import { getDoctor,getDoctorsInUserCity } from '../controller/doctor.controller.js';

const router = Router();

router.get('/getDoctor', getDoctor);
router.get('/getDoctorBycity', getDoctorsInUserCity);


export default router;
