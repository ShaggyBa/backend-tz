import { Router } from 'express';
import { User } from '../models';
import { UserController } from '../controllers';
import { Validator } from '../validation/Validator';
import { createUserSchema, updateUserSchema } from '../types';

const router = Router();
const validator = new Validator();
const ctrl = new UserController(User);

// /api/users/
router.post('/', validator.validateBody(createUserSchema), ctrl.create);

// /api/users
router.get('/', ctrl.list);

// /api/users/:id
router.get('/:id', ctrl.getById);

// /api/users/:id
router.patch('/:id', validator.validateBody(updateUserSchema), ctrl.update);

// /api/users/:id
router.delete('/:id', ctrl.delete);

export default router;
