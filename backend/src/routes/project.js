import { Router } from 'express';
import projectController from '../controllers/projectController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { createProjectSchema, updateProjectSchema } from '../validations/projectValidation.js';

const router = Router();

// Apply authMiddleware globally to all project routes
router.use(authMiddleware);

// Project CRUD Operations
router.post('/', validationMiddleware(createProjectSchema), projectController.createProject);
router.get('/', projectController.getProjects);
router.put('/:id', validationMiddleware(updateProjectSchema), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export default router;
