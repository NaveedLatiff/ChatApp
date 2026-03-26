import express from 'express';
const authRouter=express.Router()

import  { isAuthenticated, register, updateProfile} from '../controllers/auth.js'
import  {login} from '../controllers/auth.js'
import  {logout} from '../controllers/auth.js'
import userAuth from '../middleware/userAuth.js';


authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.put('/updateProfile',userAuth,updateProfile);
authRouter.get('/check',userAuth,isAuthenticated);

export default authRouter;