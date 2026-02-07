# Type Definitions - LinkPro

**Last Updated:** 2026-02-06
**Location:** `src/types/`

## Overview

TypeScript types are centralized in `src/types/` and `src/lib/validations.ts`. This document provides a reference for all major types used in the application.

## Core Types (`src/types/index.ts`)

### ActionResult<T>

Standard return type for server actions.

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### ThemeType

Available themes.

```typescript
type ThemeType = 'aurora' | 'cyber' | 'glass';
```

### WorkExperience

Work experience entry for Aurora theme.

```typescript
interface WorkExperience {
  company: string;       // Company name
  position: string;      // Job title
  startDate: string;     // Start date (YYYY-MM format)
  endDate?: string;      // End date (null = currently employed)
  description?: string;  // Job description
}
```

### User

User profile data (matches Prisma User model).

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  contact: string | null;
  projects: Project[] | null;
  experience: WorkExperience[] | null;
  theme: ThemeType;
  createdAt: Date;
  updatedAt: Date;
}
```

### Link

Social/media link (matches Prisma Link model).

```typescript
interface Link {
  id: string;
  userId: string;
  title: string;
  url: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### ThemeConfig

Theme customization configuration (reserved for future use).

```typescript
interface ThemeConfig {
  type: ThemeType;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}
```

### EditorState

Zustand editor store state.

```typescript
interface EditorState {
  links: Link[];
  theme: ThemeType;
  previewMode: boolean;
  isDirty: boolean;
  lastFetchTime: number;

  // Actions
  addLink: (link: Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateLink: (id: string, data: Partial<Link>) => void;
  deleteLink: (id: string) => void;
  reorderLinks: (startIndex: number, endIndex: number) => void;
  setTheme: (theme: ThemeType) => void;
  togglePreviewMode: () => void;
  setLinks: (links: Link[]) => void;
  resetDirty: () => void;
  setLastFetchTime: (time: number) => void;
  shouldFetch: (refreshInterval: number) => boolean;
  clear: () => void;
}
```

### ThemeProps

Props passed to theme components.

```typescript
interface ThemeProps {
  links: Link[];
  user: Pick<User, 'name' | 'bio' | 'avatarUrl' | 'username' | 'phone' | 'contact'>;
  projects?: Project[];
  skills?: string[];
  experience?: WorkExperience[];
  className?: string;
}
```

### ThemeComponent

Theme component type.

```typescript
type ThemeComponent = React.ComponentType<ThemeProps>;
```

---

## Module Types

### ModuleType

Available module types.

```typescript
type ModuleType = 'links' | 'bio' | 'skills' | 'projects';
```

### PageModule

Page module (matches Prisma PageModule model).

```typescript
interface PageModule {
  id: string;
  userId: string;
  type: ModuleType;
  title: string | null;
  data: ModuleData;
  order: number;
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### ModuleData

Union type for all module data structures.

```typescript
type ModuleData =
  | LinksModuleData
  | BioModuleData
  | SkillsModuleData
  | ProjectsModuleData;
```

### LinksModuleData

Links module data.

```typescript
interface LinksModuleData {
  type: 'links';
  linkIds: string[];  // References to Link.id
}
```

### BioModuleData

Bio/intro module data.

```typescript
interface BioModuleData {
  type: 'bio';
  name: string;
  bio: string;
  avatar: string | null;
  visibleFields?: BioVisibleFields;
}
```

### BioVisibleFields

Bio module field visibility configuration.

```typescript
interface BioVisibleFields {
  name: boolean;        // Show/hide name
  bio: boolean;         // Show/hide bio description
  avatar: boolean;      // Show/hide avatar
  phone: boolean;       // Show/hide phone number
  contact: boolean;     // Show/hide contact info
}
```

### SkillsModuleData

Skills module data.

```typescript
interface SkillsModuleData {
  type: 'skills';
  skills: string[];
}
```

### Project

Project data.

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  url: string | null;
  imageUrl: string | null;
  tags: string[];
}
```

### ProjectsModuleData

Projects module data.

```typescript
interface ProjectsModuleData {
  type: 'projects';
  projectIds: string[];  // References to User.projects array indices
}
```

### ModuleDataByType<T>

Helper type to get module data by type.

```typescript
type ModuleDataByType<T extends ModuleType> =
  T extends 'links' ? LinksModuleData :
  T extends 'bio' ? BioModuleData :
  T extends 'skills' ? SkillsModuleData :
  T extends 'projects' ? ProjectsModuleData :
  never;
```

---

## Layout Types

### LayoutItem

React-grid-layout compatible layout item.

```typescript
interface LayoutItem {
  i: string;    // Module ID
  x: number;    // Grid X position
  y: number;    // Grid Y position
  w: number;    // Width (grid units)
  h: number;    // Height (grid units)
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}
```

### DeviceMode

Device mode for layout editor.

```typescript
type DeviceMode = 'mobile' | 'desktop';
```

### DeviceLayouts

Layout configuration for both device modes.

```typescript
interface DeviceLayouts {
  mobile: LayoutItem[];
  desktop: LayoutItem[];
}
```

### LayoutEditorState

Zustand layout editor store state.

```typescript
interface LayoutEditorState {
  modules: PageModule[];
  layout: LayoutItem[];
  deviceMode: DeviceMode;
  isEditing: boolean;
  mobileLayout: LayoutItem[];
  desktopLayout: LayoutItem[];
  lastFetchTime: number;

  // Actions
  setModules: (modules: PageModule[]) => Promise<void>;
  updateLayout: (layout: LayoutItem[]) => void;
  saveLayout: () => Promise<void>;
  toggleEditing: () => void;
  setDeviceMode: (mode: DeviceMode) => void;
  setLastFetchTime: (time: number) => void;
  shouldFetch: (refreshInterval: number) => boolean;
  clear: () => void;
}
```

---

## Validation Types (`src/lib/validations.ts`)

These types are inferred from Zod schemas.

```typescript
// Re-exported for convenience
type CreateLinkInput = z.infer<typeof createLinkSchema>;
type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
type ThemeType = z.infer<typeof themeSchema>;
type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ModuleTypeInput = z.infer<typeof moduleTypeSchema>;
type CreateModuleInput = z.infer<typeof createModuleSchema>;
type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
```

---

## NextAuth Types (`src/types/next-auth.d.ts`)

Augments NextAuth types with custom user fields.

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      phone?: string | null;
      contact?: string | null;
      bio?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username: string;
    phone?: string | null;
    contact?: string | null;
    bio?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    phone?: string | null;
    contact?: string | null;
    bio?: string | null;
  }
}
```

---

## Icon Types (`src/lib/icon-dictionary.ts`)

### IconDefinition

Icon definition with metadata.

```typescript
interface IconDefinition {
  id: string;
  icon: LucideIcon;
  label: string;
  labelZh: string;
  category: IconCategory;
}
```

### IconCategory

Icon categories for grouping.

```typescript
type IconCategory =
  | "chinese-social"      // WeChat, Weibo, Douyin, etc.
  | "international-social" // GitHub, Twitter, LinkedIn, etc.
  | "communication"       // Email, phone, location
  | "general";            // Website, blog, portfolio, etc.
```

---

## Related Areas

- **[Database Schema](DATABASE.md)** - Prisma models
- **[Backend & Server Actions](BACKEND.md)** - Action signatures
- **[State Management](STATE.md)** - Store types
