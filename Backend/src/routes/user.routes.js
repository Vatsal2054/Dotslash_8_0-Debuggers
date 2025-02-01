import router from 'express';

import { createUser, getUser } from '../controllers/user.controller';

const userRouter = router();

userRouter.post('/register', createUser);

userRouter.get('/login', getUser);

export default userRouter;