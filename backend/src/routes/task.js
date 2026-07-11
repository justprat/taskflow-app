import { Router } from 'express';
import taskController from '../controllers/taskController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { createTaskSchema, updateTaskSchema } from '../validations/taskValidation.js';

const router = Router();

// Apply authMiddleware to all task routes
router.use(authMiddleware);

// Tasks operations
router.post('/', validationMiddleware(createTaskSchema), taskController.createTask);
router.put('/:id', validationMiddleware(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Fetch tasks associated with a specific project (supports pagination, filtering, search, sorting)
router.get('/project/:projectId', taskController.getTasksForProject);

// Fetch statistical summaries for dashboard
router.get('/dashboard/stats', taskController.getDashboardStats);

export default router;
