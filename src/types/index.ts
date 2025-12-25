// TypeScript type definitions for LinkPro

// Re-export Zod inferred types for convenience
export type {
  CreateLinkInput,
  UpdateLinkInput,
  UpdateProfileInput,
  RegisterInput,
  LoginInput,
} from '@/lib/validations';

// Theme type - matches Zod schema
export type ThemeType = 'aurora' | 'cyber' | 'glass';

// User interface - matches Prisma User model
export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  theme: ThemeType;
  createdAt: Date;
  updatedAt: Date;
}

// Link interface - matches Prisma Link model
export interface Link {
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

// Theme configuration for customization
export interface ThemeConfig {
  type: ThemeType;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

// Editor state interface for Zustand store
export interface EditorState {
  links: Link[];
  theme: ThemeType;
  previewMode: boolean;
  isDirty: boolean;
  
  // Actions
  addLink: (link: Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateLink: (id: string, data: Partial<Link>) => void;
  deleteLink: (id: string) => void;
  reorderLinks: (startIndex: number, endIndex: number) => void;
  setTheme: (theme: ThemeType) => void;
  togglePreviewMode: () => void;
  setLinks: (links: Link[]) => void;
  resetDirty: () => void;
}

// Server Action result type - generic wrapper for action responses
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Theme props for theme components
export interface ThemeProps {
  links: Link[];
  user: Pick<User, 'name' | 'bio' | 'avatarUrl'>;
}
