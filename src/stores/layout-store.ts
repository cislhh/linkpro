import { create } from 'zustand';
import type { PageModule, LayoutItem, LayoutEditorState } from '@/types';
import { saveLayout as saveLayoutAction } from '@/actions/module-actions';

/**
 * Layout Editor Store - Zustand store for managing the layout editor state
 * 
 * This store manages:
 * - modules: Array of user's page modules
 * - layout: Array of layout items for react-grid-layout
 * - isEditing: Whether the layout editor is in edit mode
 * 
 * Requirements: 12.1 - Layout Editor
 */
export const useLayoutStore = create<LayoutEditorState>((set, get) => ({
  // State
  modules: [],
  layout: [],
  isEditing: false,

  // Actions

  /**
   * Set the modules array (used for initial load from server)
   * Also generates the layout array from module grid positions
   * 
   * Requirements: 12.5 - Layout loading restores saved positions
   */
  setModules: (modules: PageModule[]) => {
    // Generate layout items from modules, restoring saved grid positions
    const layout: LayoutItem[] = modules.map((module) => ({
      i: module.id,
      x: module.gridX,
      y: module.gridY,
      w: module.gridW,
      h: module.gridH,
      minW: 1,
      minH: 1,
    }));

    set({ modules, layout });
  },

  /**
   * Update the layout array (called when user drags/resizes modules)
   * This updates the local state for immediate visual feedback
   */
  updateLayout: (layout: LayoutItem[]) => {
    set({ layout });
  },

  /**
   * Save the current layout to the database using batch update
   * Uses the saveLayout Server Action for efficient transaction-based updates
   * 
   * Requirements: 12.4 - Persist position and size data for all modules
   */
  saveLayout: async () => {
    const { modules, layout } = get();

    // Create a map of layout items by module ID for quick lookup
    const layoutMap = new Map(layout.map((item) => [item.i, item]));

    // Build layout items array for batch update
    // Only include modules that have changed
    const layoutItems = modules
      .map((module) => {
        const layoutItem = layoutMap.get(module.id);
        if (!layoutItem) return null;

        // Check if position/size has changed
        if (
          module.gridX === layoutItem.x &&
          module.gridY === layoutItem.y &&
          module.gridW === layoutItem.w &&
          module.gridH === layoutItem.h
        ) {
          return null; // No change, skip
        }

        return {
          id: module.id,
          gridX: layoutItem.x,
          gridY: layoutItem.y,
          gridW: layoutItem.w,
          gridH: layoutItem.h,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // If no changes, skip the server call
    if (layoutItems.length === 0) {
      return;
    }

    // Call the batch saveLayout Server Action
    const result = await saveLayoutAction(layoutItems);

    if (result.success) {
      // Update local modules with new grid positions from server response
      const updatedModulesMap = new Map(result.data.map((m) => [m.id, m]));
      
      const updatedModules = modules.map((module) => {
        const updated = updatedModulesMap.get(module.id);
        if (updated) {
          return {
            ...module,
            gridX: updated.gridX,
            gridY: updated.gridY,
            gridW: updated.gridW,
            gridH: updated.gridH,
          };
        }
        return module;
      });

      set({ modules: updatedModules });
    } else {
      // Log error but don't throw - let the UI handle error display
      console.error("Failed to save layout:", result.error);
      throw new Error(result.error);
    }
  },

  /**
   * Toggle edit mode on/off
   */
  toggleEditing: () => {
    set((state) => ({ isEditing: !state.isEditing }));
  },
}));

// Selector hooks for optimized re-renders
export const useModules = () => useLayoutStore((state) => state.modules);
export const useLayout = () => useLayoutStore((state) => state.layout);
export const useIsEditing = () => useLayoutStore((state) => state.isEditing);

// Action hooks
export const useLayoutActions = () => useLayoutStore((state) => ({
  setModules: state.setModules,
  updateLayout: state.updateLayout,
  saveLayout: state.saveLayout,
  toggleEditing: state.toggleEditing,
}));
