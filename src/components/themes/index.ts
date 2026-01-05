/**
 * Theme Components Index
 * 
 * 导出所有主题组件和相关工具
 * Requirements: 3.1
 */

export { BaseTheme } from './base-theme';
export { AuroraTheme } from './aurora-theme';
export { CyberTheme } from './cyber-theme';
export { GlassTheme } from './glass-theme';

// Theme registry - 用于动态加载主题
import type { ThemeType, ThemeComponent } from '@/types';
import { AuroraTheme } from './aurora-theme';
import { CyberTheme } from './cyber-theme';
import { GlassTheme } from './glass-theme';

// 主题组件映射表
export const themeRegistry: Record<ThemeType, ThemeComponent> = {
  aurora: AuroraTheme,
  cyber: CyberTheme,
  glass: GlassTheme,
};

/**
 * 获取主题组件
 * @param theme - 主题类型
 * @returns 对应的主题组件
 */
export function getThemeComponent(theme: ThemeType): ThemeComponent {
  return themeRegistry[theme];
}
