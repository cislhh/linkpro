"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Smartphone, RefreshCw, LayoutGrid, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivePreview, LayoutPreview } from "@/components/features/preview";
import { useEditorStore } from "@/stores/editor-store";
import { getUserProfile } from "@/actions/user-actions";

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
    const { data: session } = useSession();
    const { links, theme } = useEditorStore();
    const [userData, setUserData] = useState<{
        name: string | null;
        bio: string | null;
        avatarUrl: string | null;
        phone: string | null;
        contact: string | null;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user profile on mount
    useEffect(() => {
        let isMounted = true;

        // Skip if no session
        if (!session?.user?.id) {
            console.log("[PreviewPage] No session, skipping load");
            setIsLoading(false);
            return;
        }

        console.log("[PreviewPage] Starting user data load...");

        async function loadUserData() {
            try {
                setIsLoading(true);
                const result = await getUserProfile();

                console.log("[PreviewPage] User data loaded:", result.success ? "success" : "failed");

                if (isMounted && result.success) {
                    setUserData({
                        name: result.data.name || null,
                        bio: result.data.bio || null,
                        avatarUrl: result.data.avatarUrl || null,
                        phone: result.data.phone || null,
                        contact: result.data.contact || null,
                    });
                }
            } catch (error) {
                console.error("[PreviewPage] Failed to load user profile:", error);
            } finally {
                if (isMounted) {
                    console.log("[PreviewPage] Setting isLoading false");
                    setIsLoading(false);
                }
            }
        }

        loadUserData();

        return () => {
            isMounted = false;
        };
    }, [session?.user?.id]); // 每次 session 变化时重新加载

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
                            {links.filter((l) => l.isActive).length}
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
                            <LayoutPreview
                                userName={userData?.name}
                                userBio={userData?.bio}
                                userAvatar={userData?.avatarUrl}
                                userPhone={userData?.phone}
                                userContact={userData?.contact}
                                deviceMode="mobile"
                                isLoading={isLoading}
                            />
                        ) : (
                            <LivePreview
                                userName={userData?.name}
                                userBio={userData?.bio}
                                userAvatar={userData?.avatarUrl}
                                deviceMode="mobile"
                            />
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
