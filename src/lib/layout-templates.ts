import type { ModuleType, LayoutItem, DeviceMode } from '@/types';

/**
 * Layout Templates
 * 
 * Provides default layout configurations for page modules.
 * Used when creating new modules or initializing layouts for new users.
 * 
 * Requirements: 16.3 - Default template layout for new users
 */

/**
 * Default layout configuration for mobile view (2 columns)
 * Modules are stacked vertically with full width
 */
export const MOBILE_LAYOUT_DEFAULTS: Record<ModuleType, Omit<LayoutItem, 'i'>> = {
  bio: {
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    minW: 2,
    minH: 2,
  },
  links: {
    x: 0,
    y: 2,
    w: 2,
    h: 3,
    minW: 2,
    minH: 2,
  },
  skills: {
    x: 0,
    y: 5,
    w: 2,
    h: 2,
    minW: 2,
    minH: 1,
  },
  projects: {
    x: 0,
    y: 7,
    w: 2,
    h: 3,
    minW: 2,
    minH: 2,
  },
};

/**
 * Default layout configuration for desktop view (12 columns)
 * Modules are arranged in a more complex grid layout
 */
export const DESKTOP_LAYOUT_DEFAULTS: Record<ModuleType, Omit<LayoutItem, 'i'>> = {
  bio: {
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    minW: 3,
    minH: 2,
  },
  links: {
    x: 4,
    y: 0,
    w: 4,
    h: 3,
    minW: 3,
    minH: 2,
  },
  skills: {
    x: 8,
    y: 0,
    w: 4,
    h: 2,
    minW: 2,
    minH: 1,
  },
  projects: {
    x: 0,
    y: 2,
    w: 8,
    h: 3,
    minW: 4,
    minH: 2,
  },
};

/**
 * Get default layout for a module type based on device mode
 * 
 * @param moduleType - The type of module
 * @param deviceMode - The device mode (mobile or desktop)
 * @returns Default layout configuration without the 'i' property
 */
export function getDefaultLayoutForType(
  moduleType: ModuleType,
  deviceMode: DeviceMode
): Omit<LayoutItem, 'i'> {
  const defaults = deviceMode === 'mobile' ? MOBILE_LAYOUT_DEFAULTS : DESKTOP_LAYOUT_DEFAULTS;
  return defaults[moduleType] || {
    x: 0,
    y: 0,
    w: deviceMode === 'mobile' ? 2 : 4,
    h: 2,
    minW: 1,
    minH: 1,
  };
}

/**
 * Get default layout for a new module, calculating Y position based on existing modules
 * 
 * @param moduleId - The ID of the new module
 * @param moduleType - The type of module
 * @param deviceMode - The device mode (mobile or desktop)
 * @param existingLayout - Array of existing layout items
 * @returns Complete layout item for the new module
 */
export function getDefaultLayoutForNewModule(
  moduleId: string,
  moduleType: ModuleType,
  deviceMode: DeviceMode,
  existingLayout: LayoutItem[] = []
): LayoutItem {
  const defaults = getDefaultLayoutForType(moduleType, deviceMode);
  
  // Calculate the next available Y position
  let maxY = 0;
  existingLayout.forEach((item) => {
    const itemBottom = item.y + item.h;
    if (itemBottom > maxY) {
      maxY = itemBottom;
    }
  });

  return {
    i: moduleId,
    x: defaults.x,
    y: maxY, // Place below existing modules
    w: defaults.w,
    h: defaults.h,
    minW: defaults.minW,
    minH: defaults.minH,
  };
}

/**
 * Generate a complete default layout for a set of modules
 * Useful for initializing layouts for new users
 * 
 * @param modules - Array of module objects with id and type
 * @param deviceMode - The device mode (mobile or desktop)
 * @returns Array of layout items
 */
export function generateDefaultLayout(
  modules: Array<{ id: string; type: ModuleType }>,
  deviceMode: DeviceMode
): LayoutItem[] {
  const layout: LayoutItem[] = [];
  
  // Group modules by type for better initial arrangement
  const modulesByType = new Map<ModuleType, Array<{ id: string; type: ModuleType }>>();
  modules.forEach((module) => {
    const existing = modulesByType.get(module.type) || [];
    existing.push(module);
    modulesByType.set(module.type, existing);
  });

  // Preferred order for module types
  const typeOrder: ModuleType[] = ['bio', 'links', 'skills', 'projects'];
  
  typeOrder.forEach((type) => {
    const modulesOfType = modulesByType.get(type) || [];
    modulesOfType.forEach((module) => {
      const layoutItem = getDefaultLayoutForNewModule(
        module.id,
        module.type,
        deviceMode,
        layout
      );
      layout.push(layoutItem);
    });
  });

  return layout;
}

/**
 * Validate and fix layout items to ensure they fit within grid constraints
 * 
 * @param layout - Array of layout items to validate
 * @param deviceMode - The device mode (mobile or desktop)
 * @returns Validated and fixed layout items
 */
export function validateLayout(
  layout: LayoutItem[],
  deviceMode: DeviceMode
): LayoutItem[] {
  const maxCols = deviceMode === 'mobile' ? 2 : 12;
  
  return layout.map((item) => {
    // Ensure width doesn't exceed max columns
    const w = Math.min(item.w, maxCols);
    
    // Ensure x + w doesn't exceed max columns
    const x = Math.min(item.x, maxCols - w);
    
    return {
      ...item,
      x: Math.max(0, x),
      y: Math.max(0, item.y),
      w,
      h: Math.max(1, item.h),
      minW: Math.min(item.minW || 1, maxCols),
      minH: item.minH || 1,
    };
  });
}

/**
 * Convert desktop layout to mobile layout
 * Stacks modules vertically with full width
 * 
 * @param desktopLayout - Desktop layout items
 * @returns Mobile-optimized layout items
 */
export function convertToMobileLayout(desktopLayout: LayoutItem[]): LayoutItem[] {
  // Sort by Y position, then X position
  const sorted = [...desktopLayout].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  let currentY = 0;
  return sorted.map((item) => {
    const mobileItem: LayoutItem = {
      ...item,
      x: 0,
      y: currentY,
      w: 2, // Full width on mobile
      h: Math.max(item.h, 2), // Ensure minimum height
      minW: 2,
      minH: item.minH || 1,
    };
    currentY += mobileItem.h;
    return mobileItem;
  });
}

/**
 * Check if a layout has been customized (not using defaults)
 * 
 * @param layout - Layout items to check
 * @returns True if layout appears to be customized
 */
export function isCustomLayout(layout: LayoutItem[]): boolean {
  if (layout.length === 0) return false;
  
  // Check if any item has non-default positions
  return layout.some((item) => {
    return item.x !== 0 || item.y !== 0 || item.w !== 1 || item.h !== 1;
  });
}
