import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getMessages, getUsersForSidebar, markAsSeen, sendMessage } from '../controllers/message.js';
const messageRouter=express.Router()


messageRouter.get('/users', userAuth , getUsersForSidebar );
messageRouter.get('/:id', userAuth , getMessages);
messageRouter.put('/mark/:id' , userAuth , markAsSeen);
messageRouter.post('/send/:id' , userAuth , sendMessage);


export default messageRouter;