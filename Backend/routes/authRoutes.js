const express = require('express');
const { userRegistration, userLogin, userPasswordForget, userPasswordReset, userVerifyEmail, resendEmailOTP, userLogout} = require('../controllers/controller-user');
const { protect } = require('../middleware/authMiddleware');

const authRouter = express.Router();

authRouter.post('/register', userRegistration);
authRouter.post('/login', userLogin);
authRouter.post('/forget-password', userPasswordForget);
authRouter.post('/reset-password', userPasswordReset); // Changed from :token to body-based
authRouter.post('/verify-email', userVerifyEmail); // Changed from :token to body-based
authRouter.post('/resend-verification', resendEmailOTP);
authRouter.post('/logout', protect,  userLogout);



module.exports= authRouter;