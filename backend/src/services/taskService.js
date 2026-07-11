import taskRepository from '../repositories/taskRepository.js';
import projectService from './projectService.js';

/**
 * TaskService manages task business rules and handles project boundary assertions.
 */
class TaskService {
  /**
   * Create a new task after verifying that the user owns the target project.
   */
  async createTask(userId, taskData) {
    // Verify target project exists and belongs to the authenticated user
    await projectService.getProjectById(taskData.projectId, userId);

    return taskRepository.create(taskData);
  }

  /**
   * Retrieve a task by ID and verify that the user owns its parent project.
   */
  async getTaskById(id, userId) {
    const task = await taskRepository.findById(id);
    if (!task) {
      const error = new Error('Task not found.');
      error.statusCode = 404;
      throw error;
    }

    // Verify parent project ownership
    if (task.project.userId !== userId) {
      const error = new Error('Access denied. You do not own the project this task belongs to.');
      error.statusCode = 403; // Forbidden
      throw error;
    }

    return task;
  }

  /**
   * Update task fields after verifying user owns the parent project.
   */
  async updateTask(id, userId, updateData) {
    // Assert task exists and user has rights
    await this.getTaskById(id, userId);

    return taskRepository.update(id, updateData);
  }

  /**
   * Delete task after verifying ownership.
   */
  async deleteTask(id, userId) {
    // Assert task exists and user has rights
    await this.getTaskById(id, userId);

    return taskRepository.delete(id);
  }

  /**
   * Retrieve tasks of a specific project (with searching, status filtering, sorting, and pagination)
   * after asserting project ownership.
   */
  async getTasksForProject(projectId, userId, filters) {
    // Assert project ownership
    await projectService.getProjectById(projectId, userId);

    return taskRepository.findAndCount({
      projectId,
      search: filters.search,
      status: filters.status,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: filters.page,
      limit: filters.limit
    });
  }

  /**
   * Fetch statistical aggregates for user dashboard.
   */
  async getDashboardStats(userId) {
    return taskRepository.getUserTaskStats(userId);
  }
}

export default new TaskService();
