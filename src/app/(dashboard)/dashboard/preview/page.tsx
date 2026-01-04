"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Smartphone, Monitor, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivePreview } from "@/components/features/preview";
import { useEditorStore } from "@/stores/editor-store";
import { cn } from "@/lib/utils";

type DeviceMode = "mobile" | "desktop";

/**
 * Preview Page
 * 
 * Displays a real-time preview of the user's public page.
 * Supports both mobile and desktop preview modes.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export default function PreviewPage() {
    const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
    const { data: session } = useSession();
    const { links, theme } = useEditorStore();

    // Get user info from session
    const userName = session?.user?.name;
    const userBio = null; // Bio would come from user profile
    const userAvatar = session?.user?.image;

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
                    <Button
                        variant={deviceMode === "desktop" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDeviceMode("desktop")}
                    >
                        <Monitor className="mr-2 h-4 w-4" />
                        桌面端
                    </Button>
                    <Button
                        variant={deviceMode === "mobile" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDeviceMode("mobile")}
                    >
                        <Smartphone className="mr-2 h-4 w-4" />
                        移动端
                    </Button>
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
                        {deviceMode === "mobile" ? (
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {deviceMode === "mobile" ? "移动端" : "桌面端"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {deviceMode === "mobile" ? "375px 宽度" : "自适应宽度"}
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
                        这是访客看到的你的公开页面效果
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className={cn(
                            "flex justify-center rounded-lg bg-muted/30 p-6",
                            deviceMode === "desktop" && "overflow-x-auto"
                        )}
                    >
                        <LivePreview
                            userName={userName}
                            userBio={userBio}
                            userAvatar={userAvatar}
                            deviceMode={deviceMode}
                        />
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
