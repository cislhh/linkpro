// TypeScript type definitions for LinkPro

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

export type ThemeType = 'aurora' | 'cyber' | 'glass';

export interface ThemeConfig {
  type: ThemeType;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

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

// Server Action result type
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
