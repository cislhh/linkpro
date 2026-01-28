import { z } from 'zod';

// Link validation schemas
export const createLinkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  url: z.string().url('Invalid URL format'),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateLinkSchema = createLinkSchema.partial();

// Project schema - defined early for use in updateProfileSchema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required').max(100, 'Project name too long'),
  description: z.string().max(500, 'Description too long'),
  url: z.string().url('Invalid URL').nullable(),
  imageUrl: z.string().url('Invalid image URL').nullable(),
  tags: z.array(z.string().max(30, 'Tag too long')).max(10, 'Too many tags'),
});

// Work experience schema for Aurora theme
export const workExperienceSchema = z.object({
  company: z.string().min(1, '公司名称必填').max(100, '公司名称太长'),
  position: z.string().min(1, '职位必填').max(100, '职位名称太长'),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, '日期格式: YYYY-MM'),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, '日期格式: YYYY-MM').optional(),
  description: z.string().max(500, '描述太长').optional(),
});

// User profile validation schema
export const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal('')),
  phone: z.string().regex(/^[+]?[\d\s\-()]*$/, 'Invalid phone number').max(50).optional().or(z.literal('')),
  contact: z.string().max(200).optional().or(z.literal('')),
  projects: z.array(projectSchema).max(50, 'Too many projects').optional().or(z.literal(null)),
  experience: z.array(workExperienceSchema).max(20, 'Too many work experiences').optional().or(z.literal(null)),
});

// Theme validation schema
export const themeSchema = z.enum(['aurora', 'cyber', 'glass']);

// Authentication validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// Page Module validation schemas
// ============================================

// Module type enum
export const moduleTypeSchema = z.enum(['links', 'bio', 'skills', 'projects']);

// Links module data schema
export const linksModuleDataSchema = z.object({
  type: z.literal('links'),
  linkIds: z.array(z.string()),
});

// Bio module data schema
export const bioModuleDataSchema = z.object({
  type: z.literal('bio'),
  name: z.string().max(100, 'Name too long'),
  bio: z.string().max(500, 'Bio too long'),
  avatar: z.string().url('Invalid avatar URL').nullable().optional(),
  // Field visibility configuration - optional, defaults to all visible
  visibleFields: z.object({
    name: z.boolean().default(true),
    bio: z.boolean().default(true),
    avatar: z.boolean().default(true),
    phone: z.boolean().default(true),
    contact: z.boolean().default(true),
  }).optional(),
});

// Skills module data schema
export const skillsModuleDataSchema = z.object({
  type: z.literal('skills'),
  skills: z.array(z.string().max(50, 'Skill name too long')).max(50, 'Too many skills'),
});

// Projects module data schema - references User.projects by IDs
export const projectsModuleDataSchema = z.object({
  type: z.literal('projects'),
  projectIds: z.array(z.string()).max(20, 'Too many projects to display'),
});

// Union of all module data schemas
export const moduleDataSchema = z.discriminatedUnion('type', [
  linksModuleDataSchema,
  bioModuleDataSchema,
  skillsModuleDataSchema,
  projectsModuleDataSchema,
]);

// Create module schema
export const createModuleSchema = z.object({
  type: moduleTypeSchema,
  title: z.string().max(100, 'Title too long').optional(),
  data: moduleDataSchema,
  order: z.number().int().min(0).default(0),
  gridX: z.number().int().min(0).default(0),
  gridY: z.number().int().min(0).default(0),
  gridW: z.number().int().min(1).default(1),
  gridH: z.number().int().min(1).default(1),
});

// Update module schema (partial)
export const updateModuleSchema = z.object({
  title: z.string().max(100, 'Title too long').optional(),
  data: moduleDataSchema.optional(),
  order: z.number().int().min(0).optional(),
  gridX: z.number().int().min(0).optional(),
  gridY: z.number().int().min(0).optional(),
  gridW: z.number().int().min(1).optional(),
  gridH: z.number().int().min(1).optional(),
});

// Inferred types from schemas
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ThemeType = z.infer<typeof themeSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ModuleTypeInput = z.infer<typeof moduleTypeSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
