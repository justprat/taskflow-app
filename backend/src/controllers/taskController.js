import taskService from '../services/taskService.js';

/**
 * TaskController maps HTTP requests to task operations.
 */
class TaskController {
  /**
   * Create a task.
   */
  async createTask(req, res, next) {
    try {
      const userId = req.user.id;
      const task = await taskService.createTask(userId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Task created successfully.',
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a task.
   */
  async updateTask(req, res, next) {
    try {
      const taskId = parseInt(req.params.id, 10);
      const userId = req.user.id;

      const updatedTask = await taskService.updateTask(taskId, userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully.',
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a task.
   */
  async deleteTask(req, res, next) {
    try {
      const taskId = parseInt(req.params.id, 10);
      const userId = req.user.id;

      await taskService.deleteTask(taskId, userId);

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve tasks of a project with support for search, status filters, due date sorting, and pagination.
   */
  async getTasksForProject(req, res, next) {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const userId = req.user.id;

      // Extract filter criteria from request queries with appropriate defaults
      const search = req.query.search ? String(req.query.search).trim() : '';
      const status = req.query.status ? String(req.query.status).trim() : null;
      const sortBy = req.query.sortBy ? String(req.query.sortBy).trim() : 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const result = await taskService.getTasksForProject(projectId, userId, {
        search,
        status,
        sortBy,
        sortOrder,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        data: result.tasks,
        meta: {
          totalCount: result.totalCount,
          page,
          limit,
          totalPages: Math.ceil(result.totalCount / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve stats and activity list for the user's dashboard.
   */
  async getDashboardStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await taskService.getDashboardStats(userId);

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
