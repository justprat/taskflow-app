import { z } from 'zod';

// Helper to preprocess and parse string dates into JavaScript Date objects
const dateSchema = z.preprocess((val) => {
  if (!val) return null;
  const date = new Date(val);
  return isNaN(date.getTime()) ? undefined : date;
}, z.date().nullable());

/**
 * Zod validation schema for creating a task.
 */
export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .min(1, { message: 'Task title cannot be empty' })
    .max(150, { message: 'Task title cannot exceed 150 characters' }),
  description: z
    .string()
    .max(1000, { message: 'Description cannot exceed 1000 characters' })
    .optional()
    .nullable(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'DONE'], {
      errorMap: () => ({ message: 'Status must be either TODO, IN_PROGRESS, or DONE' })
    })
    .default('TODO'),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH'], {
      errorMap: () => ({ message: 'Priority must be either LOW, MEDIUM, or HIGH' })
    })
    .default('MEDIUM'),
  dueDate: dateSchema.optional(),
  projectId: z
    .number({ required_error: 'ProjectId is required and must be a number' })
});

/**
 * Zod validation schema for updating an existing task.
 */
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Task title cannot be empty' })
    .max(150, { message: 'Task title cannot exceed 150 characters' })
    .optional(),
  description: z
    .string()
    .max(1000, { message: 'Description cannot exceed 1000 characters' })
    .optional()
    .nullable(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'DONE'], {
      errorMap: () => ({ message: 'Status must be either TODO, IN_PROGRESS, or DONE' })
    })
    .optional(),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH'], {
      errorMap: () => ({ message: 'Priority must be either LOW, MEDIUM, or HIGH' })
    })
    .optional(),
  dueDate: dateSchema.optional()
});
