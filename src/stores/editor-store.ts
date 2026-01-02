import { create } from 'zustand';
import type { Link, ThemeType, EditorState } from '@/types';

/**
 * Editor Store - Zustand store for managing the link editor state
 * 
 * This store manages:
 * - links: Array of user's links
 * - theme: Currently selected theme
 * - previewMode: Whether preview mode is active
 * - isDirty: Whether there are unsaved changes
 * 
 * Requirements: 4.1, 4.2, 4.3 - Real-time Preview
 */
export const useEditorStore = create<EditorState>((set, get) => ({
  // State
  links: [],
  theme: 'aurora' as ThemeType,
  previewMode: false,
  isDirty: false,

  // Actions

  /**
   * Add a new link to the store
   * Generates a temporary ID for optimistic updates
   */
  addLink: (link) => {
    const newLink: Link = {
      ...link,
      id: `temp-${Date.now()}`,
      userId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      links: [...state.links, newLink],
      isDirty: true,
    }));
  },

  /**
   * Update an existing link by ID
   */
  updateLink: (id, data) => {
    set((state) => ({
      links: state.links.map((link) =>
        link.id === id
          ? { ...link, ...data, updatedAt: new Date() }
          : link
      ),
      isDirty: true,
    }));
  },

  /**
   * Delete a link by ID
   */
  deleteLink: (id) => {
    set((state) => ({
      links: state.links.filter((link) => link.id !== id),
      isDirty: true,
    }));
  },

  /**
   * Reorder links by moving a link from startIndex to endIndex
   * Updates the order property of affected links
   */
  reorderLinks: (startIndex, endIndex) => {
    set((state) => {
      const links = [...state.links];
      const removed = links.splice(startIndex, 1)[0];
      
      // Guard against invalid indices
      if (!removed) {
        return state;
      }
      
      links.splice(endIndex, 0, removed);
      
      // Update order property for all links
      const reorderedLinks = links.map((link, index) => ({
        ...link,
        order: index,
        updatedAt: new Date(),
      }));
      
      return {
        links: reorderedLinks,
        isDirty: true,
      };
    });
  },

  /**
   * Set the current theme
   */
  setTheme: (theme) => {
    set({ theme, isDirty: true });
  },

  /**
   * Toggle preview mode on/off
   */
  togglePreviewMode: () => {
    set((state) => ({ previewMode: !state.previewMode }));
  },

  /**
   * Set the entire links array (used for initial load from server)
   */
  setLinks: (links) => {
    set({ links, isDirty: false });
  },

  /**
   * Reset the dirty flag (after successful save)
   */
  resetDirty: () => {
    set({ isDirty: false });
  },
}));

// Selector hooks for optimized re-renders
export const useLinks = () => useEditorStore((state) => state.links);
export const useTheme = () => useEditorStore((state) => state.theme);
export const usePreviewMode = () => useEditorStore((state) => state.previewMode);
export const useIsDirty = () => useEditorStore((state) => state.isDirty);

// Action hooks
export const useEditorActions = () => useEditorStore((state) => ({
  addLink: state.addLink,
  updateLink: state.updateLink,
  deleteLink: state.deleteLink,
  reorderLinks: state.reorderLinks,
  setTheme: state.setTheme,
  togglePreviewMode: state.togglePreviewMode,
  setLinks: state.setLinks,
  resetDirty: state.resetDirty,
}));
