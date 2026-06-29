import express from 'express';
import { login, logout, verify, signup, updateProfile, getUsers, deleteUser } from '../controllers/auth.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { LoginSchema, SignupSchema } from '../../../shared/validation.js';

const router = express.Router();

router.post('/login', loginLimiter, validateRequest(LoginSchema), login);
// Admin only: register a staff account
router.post('/register-staff', authMiddleware, adminMiddleware, validateRequest(SignupSchema), signup);
router.post('/logout', authMiddleware, logout);
router.get('/verify', authMiddleware, verify);
// Admin: update own or any user's profile (username/password)
router.put('/profile', authMiddleware, updateProfile);
// Admin: list all users
router.get('/users', authMiddleware, adminMiddleware, getUsers);
// Admin: delete a user (staff only)
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
