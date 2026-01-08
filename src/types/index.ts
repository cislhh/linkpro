// TypeScript type definitions for LinkPro

// Re-export Zod inferred types for convenience
export type {
  CreateLinkInput,
  UpdateLinkInput,
  UpdateProfileInput,
  RegisterInput,
  LoginInput,
  ModuleTypeInput,
  CreateModuleInput,
  UpdateModuleInput,
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
  user: Pick<User, 'name' | 'bio' | 'avatarUrl' | 'username'>;
  className?: string;
}

// Base theme component type
export type ThemeComponent = React.ComponentType<ThemeProps>;

// ============================================
// Page Module Types
// ============================================

// Module type enum - matches Prisma PageModule.type field
export type ModuleType = 'links' | 'bio' | 'skills' | 'projects';

// PageModule interface - matches Prisma PageModule model
export interface PageModule {
  id: string;
  userId: string;
  type: ModuleType;
  title: string | null;
  data: ModuleData;
  order: number;
  // Layout information for grid positioning
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
  createdAt: Date;
  updatedAt: Date;
}

// Union type for all module data structures
export type ModuleData = 
  | LinksModuleData 
  | BioModuleData 
  | SkillsModuleData 
  | ProjectsModuleData;

// Links module data - references existing Link type
export interface LinksModuleData {
  type: 'links';
  linkIds: string[]; // References to Link.id
}

// Bio module data - personal introduction
export interface BioModuleData {
  type: 'bio';
  name: string;
  bio: string;
  avatar: string | null;
}

// Skills module data - skill tags cloud
export interface SkillsModuleData {
  type: 'skills';
  skills: string[];
}

// Project interface for projects module
export interface Project {
  id: string;
  name: string;
  description: string;
  url: string | null;
  imageUrl: string | null;
  tags: string[];
}

// Projects module data - project cards list
export interface ProjectsModuleData {
  type: 'projects';
  projects: Project[];
}

// Helper type to get module data by type
export type ModuleDataByType<T extends ModuleType> = 
  T extends 'links' ? LinksModuleData :
  T extends 'bio' ? BioModuleData :
  T extends 'skills' ? SkillsModuleData :
  T extends 'projects' ? ProjectsModuleData :
  never;

// Layout item for react-grid-layout
export interface LayoutItem {
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

// Layout editor state interface for Zustand store
export interface LayoutEditorState {
  modules: PageModule[];
  layout: LayoutItem[];
  isEditing: boolean;
  
  // Actions
  setModules: (modules: PageModule[]) => void;
  updateLayout: (layout: LayoutItem[]) => void;
  saveLayout: () => Promise<void>;
  toggleEditing: () => void;
}
