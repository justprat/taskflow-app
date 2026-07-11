import prisma from '../utils/prisma.js';

/**
 * ProjectRepository handles database operations for Projects.
 */
class ProjectRepository {
  /**
   * Create a new project for a user.
   */
  async create(projectData) {
    return prisma.project.create({
      data: {
        name: projectData.name,
        description: projectData.description,
        userId: projectData.userId
      }
    });
  }

  /**
   * Retrieve all projects belonging to a user, sorted by creation date (newest first).
   */
  async findAllByUserId(userId) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Retrieve a project by its primary ID.
   */
  async findById(id) {
    return prisma.project.findUnique({
      where: { id }
    });
  }

  /**
   * Update project details.
   */
  async update(id, updateData) {
    return prisma.project.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Delete a project. Because of cascade deletes in schema.prisma,
   * all related Tasks will be automatically deleted by PostgreSQL.
   */
  async delete(id) {
    return prisma.project.delete({
      where: { id }
    });
  }
}

export default new ProjectRepository();
