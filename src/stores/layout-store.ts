import { create } from 'zustand';
import type { PageModule, LayoutItem, LayoutEditorState, DeviceMode } from '@/types';
import { saveDeviceLayout, getDeviceLayouts } from '@/actions/module-actions';
import { 
  generateDefaultLayout,
  validateLayout,
  isCustomLayout,
  getDefaultLayoutForNewModule,
} from '@/lib/layout-templates';

/**
 * Layout Editor Store - Zustand store for managing the layout editor state
 * 
 * This store manages:
 * - modules: Array of user's page modules
 * - layout: Current active layout (mobile-only)
 * - mobileLayout: Layout configuration for mobile view
 * - deviceMode: Current device mode (always mobile)
 * - isEditing: Whether the layout editor is in edit mode
 * 
 * Requirements: 12.1 - Layout Editor
 * Note: Desktop mode has been removed - mobile-only implementation
 */
export const useLayoutStore = create<LayoutEditorState>((set, get) => ({
  // State
  modules: [],
  layout: [],
  deviceMode: 'mobile', // Always mobile
  isEditing: true, // Default to editing mode (Requirements: 23.1)
  mobileLayout: [],
  desktopLayout: [], // Kept for type compatibility but not used

  // Actions

  /**
   * Set the modules array (used for initial load from server)
   * Generates layout for mobile from module grid positions
   * Uses default templates for new users without custom layouts
   * 
   * Requirements: 12.5 - Layout loading restores saved positions
   * Note: Desktop layout generation removed - mobile-only implementation
   */
  setModules: async (modules: PageModule[]) => {
    // Try to load saved device layouts from user profile
    const layoutsResult = await getDeviceLayouts();
    
    let mobileLayout: LayoutItem[];

    if (layoutsResult.success && layoutsResult.data.mobileLayout) {
      // Use saved mobile layout from user profile
      mobileLayout = layoutsResult.data.mobileLayout as LayoutItem[] || [];
      
      // Ensure all modules have layout items
      const mobileIds = new Set(mobileLayout.map(l => l.i));
      
      // Add missing modules to layout
      modules.forEach(module => {
        if (!mobileIds.has(module.id)) {
          const defaultLayout = getDefaultLayoutForNewModule(module.id, module.type, 'mobile', mobileLayout);
          mobileLayout.push(defaultLayout);
        }
      });
      
      // Remove layout items for deleted modules
      const moduleIds = new Set(modules.map(m => m.id));
      mobileLayout = mobileLayout.filter(l => moduleIds.has(l.i));
    } else {
      // Generate default layout for new users
      const moduleData = modules.map((m) => ({ id: m.id, type: m.type }));
      mobileLayout = generateDefaultLayout(moduleData, 'mobile');
    }

    // Validate layout to ensure it fits within grid constraints
    mobileLayout = validateLayout(mobileLayout, 'mobile');

    set({ 
      modules, 
      layout: mobileLayout,
      mobileLayout,
      desktopLayout: [], // Not used but kept for type compatibility
    });
  },

  /**
   * Update the layout array (called when user drags/resizes modules)
   * Updates the mobile layout only
   * 
   * Note: Desktop layout removed - mobile-only implementation
   */
  updateLayout: (layout: LayoutItem[]) => {
    set({ layout, mobileLayout: layout });
  },

  /**
   * Set the device mode (kept for API compatibility but always uses mobile)
   * 
   * Note: Desktop mode removed - always uses mobile layout
   */
  setDeviceMode: (mode: DeviceMode) => {
    // Always use mobile layout regardless of mode parameter
    const { mobileLayout } = get();
    set({ deviceMode: 'mobile', layout: mobileLayout });
  },

  /**
   * Save the current layout to the user profile
   * Saves only the mobile layout
   * 
   * Requirements: 12.4 - Persist position and size data for all modules
   * Note: Desktop layout saving removed - mobile-only implementation
   */
  saveLayout: async () => {
    const { mobileLayout } = get();

    // Call the device-specific saveLayout Server Action (always mobile)
    const result = await saveDeviceLayout('mobile', mobileLayout);

    if (!result.success) {
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
export const useDeviceMode = () => useLayoutStore((state) => state.deviceMode);
export const useMobileLayout = () => useLayoutStore((state) => state.mobileLayout);
export const useDesktopLayout = () => useLayoutStore((state) => state.desktopLayout);

// Action hooks
export const useLayoutActions = () => useLayoutStore((state) => ({
  setModules: state.setModules,
  updateLayout: state.updateLayout,
  saveLayout: state.saveLayout,
  toggleEditing: state.toggleEditing,
  setDeviceMode: state.setDeviceMode,
}));

// Re-export layout template utilities for convenience
export { 
  generateDefaultLayout, 
  getDefaultLayoutForNewModule,
  validateLayout,
  isCustomLayout,
} from '@/lib/layout-templates';
