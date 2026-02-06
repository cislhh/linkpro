"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Smartphone, RefreshCw, LayoutGrid, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivePreview } from "@/components/features/preview";
import { PhoneFrame, PhoneFrameContent } from "@/components/ui/phone-frame";
import { AuroraPreviewTemplate } from "@/components/features/preview/aurora-preview-template";
import { useEditorStore } from "@/stores/editor-store";
import { useLayoutStore } from "@/stores/layout-store";
import { useUserStore } from "@/stores/user-store";
import type { Link, Project } from "@/types";

type PreviewMode = "links" | "layout";

/**
 * Preview Page
 *
 * Displays a real-time preview of the user's public page.
 * Mobile-only mode - optimized for mobile devices.
 * Supports both links-only view and full layout view.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 * Requirements: 16.1 - Display layout result in preview page
 */
export default function PreviewPage() {
    const [previewMode, setPreviewMode] = useState<PreviewMode>("layout");

    // Read from stores instead of fetching data
    const { links, theme } = useEditorStore();
    const { mobileLayout, modules: storeModules } = useLayoutStore();
    const { profile, projects } = useUserStore();

    // Check if data is loaded from DataProvider
    const isDataLoaded = profile.name !== null || profile.name !== undefined;
    const isLoading = !isDataLoaded && links.length === 0 && storeModules.length === 0;

    // rerender-derived-state: 使用 useMemo 缓存派生状态
    const activeLinksCount = useMemo(
        () => links.filter((l) => l.isActive).length,
        [links]
    );

    // Show loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">预览页面</h1>
                    <p className="text-muted-foreground">实时预览你的个人主页效果</p>
                </div>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">预览页面</h1>
                    <p className="text-muted-foreground">
                        实时预览你的个人主页效果
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Preview Mode Toggle */}
                    <div className="flex rounded-lg border p-1">
                        <Button
                            variant={previewMode === "layout" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setPreviewMode("layout")}
                            className="h-8"
                        >
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            布局预览
                        </Button>
                        <Button
                            variant={previewMode === "links" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setPreviewMode("links")}
                            className="h-8"
                        >
                            <LinkIcon className="mr-2 h-4 w-4" />
                            链接预览
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">活跃链接</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activeLinksCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            共 {links.length} 个链接
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">当前主题</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{theme}</div>
                        <p className="text-xs text-muted-foreground">
                            {getThemeDescription(theme)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">预览模式</CardTitle>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">移动端</div>
                        <p className="text-xs text-muted-foreground">
                            {previewMode === "layout" ? "布局预览" : "链接预览"} · 375px 宽度
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Live Preview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        <CardTitle>实时预览</CardTitle>
                    </div>
                    <CardDescription>
                        {previewMode === "layout"
                            ? "这是访客看到的你的公开页面效果（包含自定义布局）"
                            : "这是访客看到的你的链接列表效果"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg bg-muted/30 p-6 flex justify-center">
                        {previewMode === "layout" ? (
                            // Aurora Theme Preview with PhoneFrame
                            theme === "aurora" ? (
                                <PhoneFrame variant="default" contentBackground="transparent">
                                    <PhoneFrameContent paddingTop="12px" paddingBottom="8px">
                                        <AuroraPreviewTemplate
                                            modules={storeModules}
                                            layout={mobileLayout}
                                            userName={profile.name}
                                            userBio={profile.bio}
                                            userAvatar={profile.avatarUrl}
                                            userPhone={profile.phone}
                                            userContact={profile.contact}
                                            links={links}
                                            userProjects={projects || undefined}
                                        />
                                    </PhoneFrameContent>
                                </PhoneFrame>
                            ) : (
                                // Fallback to original LayoutPreview for cyber and glass themes
                                // TODO: Implement CyberPreviewTemplate and GlassPreviewTemplate
                                <div className="w-[375px] rounded-2xl border bg-background shadow-lg overflow-hidden">
                                    <div className="px-6 py-12">
                                        <p className="text-center text-muted-foreground">
                                            {theme === "cyber" && "赛博主题预览即将推出"}
                                            {theme === "glass" && "玻璃主题预览即将推出"}
                                        </p>
                                    </div>
                                </div>
                            )
                        ) : (
                            // Links-only preview
                            <PhoneFrame variant="default">
                                <PhoneFrameContent paddingTop="50px" paddingBottom="24px">
                                    <LivePreview
                                        userName={profile.name}
                                        userBio={profile.bio}
                                        userAvatar={profile.avatarUrl}
                                        deviceMode="mobile"
                                    />
                                </PhoneFrameContent>
                            </PhoneFrame>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * Get theme description in Chinese
 */
function getThemeDescription(theme: string): string {
    switch (theme) {
        case "aurora":
            return "极光渐变效果";
        case "cyber":
            return "赛博霓虹效果";
        case "glass":
            return "玻璃拟态效果";
        default:
            return "默认主题";
    }
}
