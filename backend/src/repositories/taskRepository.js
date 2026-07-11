import prisma from '../utils/prisma.js';

/**
 * TaskRepository handles database queries and operations for Tasks.
 */
class TaskRepository {
  /**
   * Create a new task.
   */
  async create(taskData) {
    return prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'TODO',
        priority: taskData.priority || 'MEDIUM',
        dueDate: taskData.dueDate || null,
        projectId: taskData.projectId
      }
    });
  }

  /**
   * Find a task by its primary ID, including its parent project information.
   */
  async findById(id) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: true // Include project details to verify ownership in services
      }
    });
  }

  /**
   * Update task fields.
   */
  async update(id, updateData) {
    return prisma.task.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Delete a task.
   */
  async delete(id) {
    return prisma.task.delete({
      where: { id }
    });
  }

  /**
   * Query tasks of a project with filters, search, sorting, and pagination.
   * Returns a promise of { tasks, totalCount } using a Prisma transaction.
   */
  async findAndCount({ projectId, search, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 }) {
    // 1. Build the dynamic where clause
    const where = {
      projectId: projectId
    };

    // Filter by task status if provided
    if (status) {
      where.status = status;
    }

    // Full-text search on Title or Description (case-insensitive)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 2. Build the order clause
    const orderBy = {};
    if (sortBy === 'dueDate') {
      orderBy.dueDate = sortOrder; // Sort by due date
    } else {
      orderBy.createdAt = sortOrder; // Default fallback sort
    }

    const skip = (page - 1) * limit;

    // 3. Execute count and find queries concurrently in a transaction
    const [tasks, totalCount] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      prisma.task.count({ where })
    ]);

    return {
      tasks,
      totalCount
    };
  }

  /**
   * Fetch statistical aggregates for a user's dashboard.
   * Finds all tasks across all projects owned by the user.
   */
  async getUserTaskStats(userId) {
    const projectFilter = { project: { userId } };

    const [totalTasks, completedTasks, pendingTasks, recentActivity] = await prisma.$transaction([
      // Total count of tasks for this user
      prisma.task.count({
        where: projectFilter
      }),
      // Count of completed tasks
      prisma.task.count({
        where: {
          ...projectFilter,
          status: 'DONE'
        }
      }),
      // Count of pending tasks (TODO + IN_PROGRESS)
      prisma.task.count({
        where: {
          ...projectFilter,
          status: { in: ['TODO', 'IN_PROGRESS'] }
        }
      }),
      // 5 most recently updated tasks for the "Recent Activity" panel
      prisma.task.findMany({
        where: projectFilter,
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          project: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      recentActivity
    };
  }
}

export default new TaskRepository();
