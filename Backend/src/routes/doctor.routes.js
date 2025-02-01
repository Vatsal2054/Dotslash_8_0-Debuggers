import Router from 'express';
import { getDoctor } from '../controller/doctor.controller';

const router = Router();

router.get('/', getDoctor);

export default router;
