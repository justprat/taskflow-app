import { PrismaClient } from '@prisma/client';

// Instantiate the Prisma Client
const prisma = new PrismaClient();

// Export the instance for use in repositories
export default prisma;
