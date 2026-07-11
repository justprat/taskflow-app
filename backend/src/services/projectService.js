import projectRepository from '../repositories/projectRepository.js';

/**
 * ProjectService handles project business logic and ownership authorization.
 */
class ProjectService {
  /**
   * Create a project.
   */
  async createProject(projectData) {
    return projectRepository.create(projectData);
  }

  /**
   * Retrieve all projects owned by a user.
   */
  async getProjects(userId) {
    return projectRepository.findAllByUserId(userId);
  }

  /**
   * Retrieve a specific project and verify the user owns it.
   */
  async getProjectById(id, userId) {
    const project = await projectRepository.findById(id);
    if (!project) {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      throw error;
    }

    if (project.userId !== userId) {
      const error = new Error('Access denied. You do not own this project.');
      error.statusCode = 403; // Forbidden
      throw error;
    }

    return project;
  }

  /**
   * Update project details after checking ownership.
   */
  async updateProject(id, userId, updateData) {
    // Verify project exists and belongs to the user
    await this.getProjectById(id, userId);

    return projectRepository.update(id, updateData);
  }

  /**
   * Delete a project and all its tasks after checking ownership.
   */
  async deleteProject(id, userId) {
    // Verify project exists and belongs to the user
    await this.getProjectById(id, userId);

    return projectRepository.delete(id);
  }
}

export default new ProjectService();
