# Libraries & Utilities - LinkPro

**Last Updated:** 2026-02-06
**Location:** `src/lib/`

## Overview

The `src/lib/` directory contains utility functions, configurations, and helper modules used throughout the application.

## Files

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth.js configuration |
| `db.ts` | Prisma client singleton |
| `validations.ts` | Zod validation schemas |
| `constants.ts` | Application constants |
| `utils.ts` | Utility functions |
| `errors.ts` | Custom error classes |
| `icon-dictionary.ts` | Icon definitions and lookup |
| `layout-templates.ts` | Default layout configurations |

---

## Authentication (`src/lib/auth.ts`)

NextAuth.js configuration with Credentials provider.

### Exports

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({...});
```

### Configuration

```typescript
{
  session: {
    strategy: "jwt",
    maxAge: ONE_DAY_SECONDS,  // or SEVEN_DAYS_SECONDS with remember me
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [Credentials({ ... })],
}
```

### Session Durations

| Mode | Duration |
|------|----------|
| Default | 1 day (86,400 seconds) |
| Remember Me | 7 days (604,800 seconds) |

### Usage

```typescript
// Get session in Server Component/Action
const session = await auth();
if (session?.user?.id) {
  // Authenticated
}
```

---

## Database (`src/lib/db.ts`)

Singleton Prisma client with hot-reload prevention.

```typescript
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : ["error"],
});
```

### Logging

| Environment | Logs |
|-------------|------|
| Development | query, error, warn |
| Production | error only |

### Usage

```typescript
import { prisma } from "@/lib/db";

const user = await prisma.user.findUnique({
  where: { email },
});
```

---

## Validations (`src/lib/validations.ts`)

Zod schemas for runtime validation.

### Link Schemas

```typescript
// Create link
createLinkSchema = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url(),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// Update link (partial)
updateLinkSchema = createLinkSchema.partial();
```

### Module Schemas

```typescript
// Base module type
moduleTypeSchema = z.enum(['links', 'bio', 'skills', 'projects']);

// Links module
linksModuleDataSchema = z.object({
  type: z.literal('links'),
  linkIds: z.array(z.string()),
});

// Bio module
bioModuleDataSchema = z.object({
  type: z.literal('bio'),
  name: z.string().max(100),
  bio: z.string().max(500),
  avatar: z.string().url().nullable().optional(),
  visibleFields: z.object({
    name: z.boolean().default(true),
    bio: z.boolean().default(true),
    avatar: z.boolean().default(true),
    phone: z.boolean().default(true),
    contact: z.boolean().default(true),
  }).optional(),
});

// Skills module
skillsModuleDataSchema = z.object({
  type: z.literal('skills'),
  skills: z.array(z.string().max(50)).max(50),
});

// Projects module
projectsModuleDataSchema = z.object({
  type: z.literal('projects'),
  projectIds: z.array(z.string()).max(20),
});

// Union of all module data
moduleDataSchema = z.discriminatedUnion('type', [
  linksModuleDataSchema,
  bioModuleDataSchema,
  skillsModuleDataSchema,
  projectsModuleDataSchema,
]);
```

### Profile Schemas

```typescript
// Project
projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  url: z.string().url().nullable(),
  imageUrl: z.string().url().nullable(),
  tags: z.array(z.string().max(30)).max(10),
});

// Work experience
workExperienceSchema = z.object({
  company: z.string().min(1).max(100),
  position: z.string().min(1).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  description: z.string().max(500).optional(),
});

// User profile
updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal('')),
  phone: z.string().regex(/^[+]?[\d\s\-()]*$/).max(50).optional().or(z.literal('')),
  contact: z.string().max(200).optional().or(z.literal('')),
  projects: z.array(projectSchema).max(50).optional().or(z.literal(null)),
  experience: z.array(workExperienceSchema).max(20).optional().or(z.literal(null)),
});
```

### Auth Schemas

```typescript
// Theme
themeSchema = z.enum(['aurora', 'cyber', 'glass']);

// Register
registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
});

// Login
loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

---

## Constants (`src/lib/constants.ts`)

Application-level constants.

### Avatar Specifications

```typescript
export const AVATAR_SPEC = {
  maxSize: 2 * 1024 * 1024,        // 2MB
  allowedFormats: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ],
  recommendedSize: { width: 400, height: 400 },
  minSize: { width: 200, height: 200 },
} as const;
```

---

## Utilities (`src/lib/utils.ts`)

General utility functions.

### `cn()`

Class name merger using `clsx` and `tailwind-merge`.

```typescript
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Usage:**
```typescript
<div className={cn("base-class", isActive && "active-class", className)} />
```

---

## Errors (`src/lib/errors.ts`)

Custom error classes with error codes.

### Error Classes

```typescript
class AppError extends Error {
  constructor(message: string, code: string, statusCode: number = 400);
}

class ValidationError extends AppError {
  constructor(message: string, public fields: Record<string, string[]>);
}

class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required');
}

class NotFoundError extends AppError {
  constructor(resource: string);
}
```

### Helper Functions

```typescript
// Type guard
function isAppError(error: unknown): error is AppError;

// Format error message
function formatErrorMessage(error: unknown): string;

// Wrap function with error handling
async function withErrorHandling<T>(
  fn: () => Promise<T>,
  fallbackMessage: string = 'Operation failed'
): Promise<ActionResult<T>>;
```

---

## Icon Dictionary (`src/lib/icon-dictionary.ts`)

Centralized icon definitions for links.

### Icon Categories

| Category | Icons |
|----------|-------|
| `chinese-social` | WeChat, Weibo, Douyin, Xiaohongshu, Bilibili, Zhihu |
| `international-social` | GitHub, Twitter, LinkedIn, Instagram, YouTube, Facebook, Twitch |
| `communication` | Email, Phone, Location |
| `general` | Website, Link, Blog, Portfolio, Education, Coffee, Donate, etc. |

### Functions

```typescript
// Get icon definition by ID
function getIconById(id: string): IconDefinition | undefined;

// Get icons by category
function getIconsByCategory(category: IconCategory): IconDefinition[];

// Get all icon IDs (for validation)
function getAllIconIds(): string[];

// Check if icon ID is valid
function isValidIconId(id: string): boolean;
```

**Usage:**
```typescript
import { getIconById } from "@/lib/icon-dictionary";

const iconDef = getIconById("github");
if (iconDef) {
  console.log(iconDef.labelZh); // "GitHub"
}
```

---

## Layout Templates (`src/lib/layout-templates.ts`)

Default layout configurations for page modules.

### Default Layouts

```typescript
// Mobile (2 columns)
MOBILE_LAYOUT_DEFAULTS: Record<ModuleType, Omit<LayoutItem, 'i'>> = {
  bio: { x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
  links: { x: 0, y: 2, w: 2, h: 3, minW: 2, minH: 2 },
  skills: { x: 0, y: 5, w: 2, h: 2, minW: 2, minH: 1 },
  projects: { x: 0, y: 7, w: 2, h: 3, minW: 2, minH: 2 },
};

// Desktop (12 columns)
DESKTOP_LAYOUT_DEFAULTS: Record<ModuleType, Omit<LayoutItem, 'i'>> = {
  bio: { x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
  links: { x: 4, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
  skills: { x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 1 },
  projects: { x: 0, y: 2, w: 8, h: 3, minW: 4, minH: 2 },
};
```

### Functions

```typescript
// Get default layout for a module type
function getDefaultLayoutForType(
  moduleType: ModuleType,
  deviceMode: DeviceMode
): Omit<LayoutItem, 'i'>;

// Get default layout for a new module
function getDefaultLayoutForNewModule(
  moduleId: string,
  moduleType: ModuleType,
  deviceMode: DeviceMode,
  existingLayout: LayoutItem[]
): LayoutItem;

// Generate complete default layout
function generateDefaultLayout(
  modules: Array<{ id: string; type: ModuleType }>,
  deviceMode: DeviceMode
): LayoutItem[];

// Validate and fix layout
function validateLayout(
  layout: LayoutItem[],
  deviceMode: DeviceMode
): LayoutItem[];

// Convert desktop to mobile layout
function convertToMobileLayout(desktopLayout: LayoutItem[]): LayoutItem[];

// Check if layout is customized
function isCustomLayout(layout: LayoutItem[]): boolean;
```

---

## Related Areas

- **[Backend & Server Actions](BACKEND.md)** - Usage of utilities in server actions
- **[Type Definitions](TYPES.md)** - Type definitions for validation schemas
- **[State Management](STATE.md)** - Store usage of utilities
