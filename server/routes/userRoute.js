import express from 'express';
import { getPincodeDetails, register, login, profile, addAddress, getAddress, updateProfile, updateAddress, deleteAddress, submitComplaint } from '../controllers/userController.js'
import { requireAuth } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/profile', requireAuth, profile);
userRouter.patch('/profile', requireAuth, updateProfile);
userRouter.get('/address', requireAuth, getAddress);
userRouter.post('/address', requireAuth, addAddress);
userRouter.patch('/address/:id', requireAuth, updateAddress);
userRouter.delete('/address/:id', requireAuth, deleteAddress);
userRouter.get("/address/:pincode", requireAuth, getPincodeDetails);
userRouter.post('/complaint', requireAuth, submitComplaint);

export default userRouter;
