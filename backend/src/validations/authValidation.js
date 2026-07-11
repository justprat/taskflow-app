import { z } from 'zod';

/**
 * Zod validation schema for signing up/creating a new user.
 */
export const signupSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address format' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must not exceed 50 characters' })
});

/**
 * Zod validation schema for logging in.
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address format' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password cannot be empty' })
});
