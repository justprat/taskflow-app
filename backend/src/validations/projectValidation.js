import { z } from 'zod';

/**
 * Zod validation schema for creating a project.
 */
export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(1, { message: 'Project name cannot be empty' })
    .max(100, { message: 'Project name cannot exceed 100 characters' }),
  description: z
    .string()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .optional()
    .nullable()
});

/**
 * Zod validation schema for updating an existing project.
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Project name cannot be empty' })
    .max(100, { message: 'Project name cannot exceed 100 characters' })
    .optional(),
  description: z
    .string()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .optional()
    .nullable()
});
