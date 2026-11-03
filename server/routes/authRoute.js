import express from 'express';
import { sendOtpLimiter, verifyOtpLimiter } from '../middleware/otpMiddleware.js';
import { sendOtp, verifyOtp, onBoard, me, logOut } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const authRouter = express.Router();

authRouter.post('/send-otp', sendOtpLimiter, sendOtp);
authRouter.post('/verify-otp', verifyOtpLimiter, verifyOtp);
authRouter.post('/onboard', requireAuth, onBoard);
authRouter.get ('/me', requireAuth, me);
authRouter.post('/logout', requireAuth, logOut);

export default authRouter;
