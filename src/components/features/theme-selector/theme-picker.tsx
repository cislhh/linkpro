'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { ThemeType } from '@/types';
import { ThemePreview } from './theme-preview';
import { updateUserTheme } from '@/actions/user-actions';
import { useEditorStore } from '@/stores/editor-store';

/**
 * ThemePicker - 主题选择器组件
 * 
 * 展示所有可用主题的预览缩略图，支持：
 * - 主题预览展示
 * - 点击选择主题
 * - 与 Zustand store 同步
 * - 调用 Server Action 持久化
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

// 可用主题列表
const availableThemes: ThemeType[] = ['aurora', 'cyber', 'glass'];

interface ThemePickerProps {
    initialTheme?: ThemeType;
}

export function ThemePicker({ initialTheme = 'aurora' }: ThemePickerProps) {
    const [isPending, startTransition] = useTransition();
    const { theme, setTheme } = useEditorStore();

    // 使用 store 中的主题，如果没有则使用初始值
    const currentTheme = theme || initialTheme;

    const handleThemeSelect = (selectedTheme: ThemeType) => {
        // 如果选择的是当前主题，不做任何操作
        if (selectedTheme === currentTheme) {
            return;
        }

        // 乐观更新 - 立即更新 Zustand store
        setTheme(selectedTheme);

        // 调用 Server Action 持久化到数据库
        startTransition(async () => {
            const result = await updateUserTheme(selectedTheme);

            if (result.success) {
                toast.success('主题已更新');
            } else {
                // 回滚到之前的主题
                setTheme(currentTheme);
                toast.error(result.error || '更新主题失败');
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableThemes.map((themeOption) => (
                    <ThemePreview
                        key={themeOption}
                        theme={themeOption}
                        isSelected={currentTheme === themeOption}
                        onClick={() => handleThemeSelect(themeOption)}
                    />
                ))}
            </div>

            {isPending && (
                <p className="text-sm text-muted-foreground text-center">
                    正在保存主题设置...
                </p>
            )}
        </div>
    );
}
