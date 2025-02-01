import Router from 'express';
import { getDoctor } from '../controller/doctor.controller.js';

const router = Router();

router.get('/', getDoctor);

export default router;
