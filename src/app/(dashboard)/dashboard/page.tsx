"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Eye, Palette } from "lucide-react";
import { LinkList } from "@/components/features/link-editor";
import { LivePreview } from "@/components/features/preview";
import { useEditorStore } from "@/stores/editor-store";
import { getUserLinks } from "@/actions/link-actions";

/**
 * Dashboard Page
 * 
 * Main dashboard with link editor and real-time preview side by side.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 6.1
 */
export default function DashboardPage() {
    const { data: session } = useSession();
    const { links, theme, setLinks } = useEditorStore();

    // Get user info from session
    const userName = session?.user?.name;
    const userAvatar = session?.user?.image;

    /**
     * Load links from server on initial mount
     * This ensures the store is populated with the latest data from the database
     * 
     * Requirements: 2.2
     */
    useEffect(() => {
        async function loadLinks() {
            const result = await getUserLinks();
            if (result.success) {
                setLinks(result.data);
            }
        }
        loadLinks();
    }, [setLinks]);

    return (
        <div className="flex h-full gap-6">
            {/* Left Side - Link Editor */}
            <div className="flex-1 space-y-6 overflow-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        管理你的链接和个人主页设置
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">链接数量</CardTitle>
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{links.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {links.filter((l) => l.isActive).length} 个活跃链接
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">当前主题</CardTitle>
                            <Palette className="h-4 w-4 text-muted-foreground" />
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
                            <CardTitle className="text-sm font-medium">页面访问</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">
                                即将推出
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Link Editor */}
                <Card>
                    <CardHeader>
                        <CardTitle>我的链接</CardTitle>
                        <CardDescription>
                            在这里管理你的社交链接，支持拖拽排序
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LinkList />
                    </CardContent>
                </Card>
            </div>

            {/* Right Side - Live Preview */}
            <div className="hidden w-[420px] flex-shrink-0 lg:block">
                <div className="sticky top-0">
                    <Card className="h-fit">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <CardTitle className="text-base">实时预览</CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                                访客看到的页面效果
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center pb-6">
                            <LivePreview
                                userName={userName}
                                userBio={null}
                                userAvatar={userAvatar}
                                deviceMode="mobile"
                                className="scale-[0.85] origin-top"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
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
