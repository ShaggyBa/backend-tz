import { Router } from 'express';
import { AuthController } from '../controllers';
import { User } from '../models';
import { requireAuth } from '../middleware/authHandler';

const router = Router();
const ctrl = new AuthController(User);

// /api/auth/register
router.post('/register', ctrl.register);

// /api/auth/login
router.post('/login', ctrl.login);

// /api/auth/refresh
router.post('/refresh', ctrl.refresh);

// /api/auth/logout
router.post('/logout', requireAuth, ctrl.logout);

export default router;
