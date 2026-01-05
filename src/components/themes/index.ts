/**
 * Theme Components Index
 * 
 * 导出所有主题组件和相关工具
 * Requirements: 3.1
 */

export { BaseTheme } from './base-theme';

// Theme registry - 用于动态加载主题
import type { ThemeType, ThemeComponent } from '@/types';

// 主题组件映射表 - 将在具体主题实现后填充
export const themeRegistry: Record<ThemeType, ThemeComponent | null> = {
  aurora: null,  // TODO: Task 16.1
  cyber: null,   // TODO: Task 16.2
  glass: null,   // TODO: Task 16.3
};

/**
 * 获取主题组件
 * @param theme - 主题类型
 * @returns 对应的主题组件，如果不存在则返回 null
 */
export function getThemeComponent(theme: ThemeType): ThemeComponent | null {
  return themeRegistry[theme];
}
