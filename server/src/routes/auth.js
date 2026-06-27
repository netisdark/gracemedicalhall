import express from 'express';
import { login, logout, verify, signup } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { LoginSchema, SignupSchema } from '../../../shared/validation.js';

const router = express.Router();

router.post('/login', loginLimiter, validateRequest(LoginSchema), login);
router.post('/signup', loginLimiter, validateRequest(SignupSchema), signup);
router.post('/logout', authMiddleware, logout);
router.get('/verify', authMiddleware, verify);

export default router;
