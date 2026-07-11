import projectService from '../services/projectService.js';

/**
 * ProjectController maps HTTP routes to project business operations.
 */
class ProjectController {
  /**
   * Create a new project.
   */
  async createProject(req, res, next) {
    try {
      const { name, description } = req.body;
      const userId = req.user.id;

      const project = await projectService.createProject({
        name,
        description,
        userId
      });

      return res.status(201).json({
        success: true,
        message: 'Project created successfully.',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all projects for the authenticated user.
   */
  async getProjects(req, res, next) {
    try {
      const userId = req.user.id;
      const projects = await projectService.getProjects(userId);

      return res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a project.
   */
  async updateProject(req, res, next) {
    try {
      const projectId = parseInt(req.params.id, 10);
      const userId = req.user.id;

      const updatedProject = await projectService.updateProject(projectId, userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully.',
        data: updatedProject
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a project.
   */
  async deleteProject(req, res, next) {
    try {
      const projectId = parseInt(req.params.id, 10);
      const userId = req.user.id;

      await projectService.deleteProject(projectId, userId);

      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();
