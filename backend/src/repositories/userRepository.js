import prisma from '../utils/prisma.js';

/**
 * UserRepository provides direct access to the User table in PostgreSQL.
 */
class UserRepository {
  /**
   * Find a user by their email address.
   * Useful during login and signup duplication checks.
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Find a user by their primary key ID.
   * Useful in auth middleware token parsing.
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Insert a new user record into the database.
   */
  async create(userData) {
    return prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password, // This should be pre-hashed
        name: userData.name
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
  }
}

export default new UserRepository();
