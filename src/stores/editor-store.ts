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
 * - lastFetchTime: Timestamp of last data fetch
 *
 * Requirements: 4.1, 4.2, 4.3 - Real-time Preview
 */
export const useEditorStore = create<EditorState>((set, get) => ({
  // State
  links: [],
  theme: 'aurora' as ThemeType,
  previewMode: false,
  isDirty: false,
  lastFetchTime: 0,

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

  /**
   * Set the timestamp of last data fetch
   */
  setLastFetchTime: (time) => {
    set({ lastFetchTime: time });
  },

  /**
   * Check if data should be refetched based on refresh interval
   */
  shouldFetch: (refreshInterval) => {
    const { lastFetchTime } = get();
    return Date.now() - lastFetchTime > refreshInterval;
  },

  /**
   * Clear all store data (for logout)
   */
  clear: () => {
    set({
      links: [],
      theme: 'aurora' as ThemeType,
      previewMode: false,
      isDirty: false,
      lastFetchTime: 0,
    });
  },
}));

// Selector hooks for optimized re-renders
export const useLinks = () => useEditorStore((state) => state.links);
export const useTheme = () => useEditorStore((state) => state.theme);
export const usePreviewMode = () => useEditorStore((state) => state.previewMode);
export const useIsDirty = () => useEditorStore((state) => state.isDirty);

// Action hooks - 分别导出每个 action selector 以获得稳定的引用
// 这是避免无限循环的正确方式：每个函数的引用都是稳定的
// 推荐在组件中直接使用这些单独的 hooks
export const useAddLink = () => useEditorStore((state) => state.addLink);
export const useUpdateLink = () => useEditorStore((state) => state.updateLink);
export const useDeleteLink = () => useEditorStore((state) => state.deleteLink);
export const useReorderLinks = () => useEditorStore((state) => state.reorderLinks);
export const useSetTheme = () => useEditorStore((state) => state.setTheme);
export const useTogglePreviewMode = () => useEditorStore((state) => state.togglePreviewMode);
export const useSetLinks = () => useEditorStore((state) => state.setLinks);
export const useResetDirty = () => useEditorStore((state) => state.resetDirty);
