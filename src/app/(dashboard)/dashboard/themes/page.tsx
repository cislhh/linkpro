"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemePicker } from "@/components/features/theme-selector";
import { useEditorStore, useTheme } from "@/stores/editor-store";
import { getThemeComponent } from "@/components/themes";
import type { Link, ThemeType } from "@/types";

/**
 * ThemesPage - 主题设置页面
 * 
 * 功能：
 * - 展示所有可用主题的预览缩略图
 * - 支持点击选择主题
 * - 实时预览选中主题效果
 * - 与 Zustand store 和 Server Action 集成
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

// 示例链接数据用于预览
const sampleLinks: Link[] = [
    {
        id: 'sample-1',
        userId: 'sample',
        title: 'GitHub',
        url: 'https://github.com',
        icon: '🐙',
        order: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'sample-2',
        userId: 'sample',
        title: 'Twitter',
        url: 'https://twitter.com',
        icon: '🐦',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'sample-3',
        userId: 'sample',
        title: 'Portfolio',
        url: 'https://example.com',
        icon: '🌐',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

// 示例用户数据用于预览
const sampleUser = {
    name: 'Demo User',
    bio: '这是一个主题预览示例',
    avatarUrl: null,
    username: 'demo',
};

export default function ThemesPage() {
    const currentTheme = useTheme();
    const ThemeComponent = getThemeComponent(currentTheme);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">主题设置</h1>
                <p className="text-muted-foreground">
                    选择你喜欢的主题风格，预览效果将实时更新
                </p>
            </div>

            {/* Theme Picker */}
            <Card>
                <CardHeader>
                    <CardTitle>选择主题</CardTitle>
                    <CardDescription>
                        点击选择你喜欢的主题，更改将自动保存
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemePicker initialTheme={currentTheme} />
                </CardContent>
            </Card>

            {/* Live Theme Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>主题预览</CardTitle>
                    <CardDescription>
                        当前选中: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} 主题
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative h-[500px] overflow-hidden rounded-b-lg">
                        <div className="absolute inset-0 scale-[0.6] origin-top">
                            <ThemeComponent
                                links={sampleLinks}
                                user={sampleUser}
                            />
                        </div>
                        {/* Overlay gradient for smooth edge */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
