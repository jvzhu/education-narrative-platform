import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['admin', 'educator', 'student']).optional().default('student')
});

export const narrativeSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('draft')
});

export const commentSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().optional()
});

export const ratingSchema = z.object({
  score: z.number().int().min(1).max(5),
  review: z.string().optional()
});
