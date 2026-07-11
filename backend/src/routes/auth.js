import { Router } from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { signupSchema, loginSchema } from '../validations/authValidation.js';

const router = Router();

// Public routes for user onboarding and session management
router.post('/signup', validationMiddleware(signupSchema), authController.signup);
router.post('/login', validationMiddleware(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected route to fetch current active profile
router.get('/me', authMiddleware, authController.me);

export default router;
