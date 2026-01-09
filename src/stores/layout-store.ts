import { create } from 'zustand';
import type { PageModule, LayoutItem, LayoutEditorState } from '@/types';
import { updateModule } from '@/actions/module-actions';

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
   */
  setModules: (modules: PageModule[]) => {
    // Generate layout items from modules
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
   * Save the current layout to the database
   * Updates each module's grid position based on the layout array
   */
  saveLayout: async () => {
    const { modules, layout } = get();

    // Create a map of layout items by module ID for quick lookup
    const layoutMap = new Map(layout.map((item) => [item.i, item]));

    // Update each module's grid position in the database
    const updatePromises = modules.map(async (module) => {
      const layoutItem = layoutMap.get(module.id);
      if (!layoutItem) return;

      // Only update if position/size has changed
      if (
        module.gridX !== layoutItem.x ||
        module.gridY !== layoutItem.y ||
        module.gridW !== layoutItem.w ||
        module.gridH !== layoutItem.h
      ) {
        await updateModule(module.id, {
          gridX: layoutItem.x,
          gridY: layoutItem.y,
          gridW: layoutItem.w,
          gridH: layoutItem.h,
        });
      }
    });

    await Promise.all(updatePromises);

    // Update local modules with new grid positions
    const updatedModules = modules.map((module) => {
      const layoutItem = layoutMap.get(module.id);
      if (!layoutItem) return module;

      return {
        ...module,
        gridX: layoutItem.x,
        gridY: layoutItem.y,
        gridW: layoutItem.w,
        gridH: layoutItem.h,
      };
    });

    set({ modules: updatedModules });
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
