"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid, Eye, Palette } from "lucide-react";
import { ModuleSelector, ModuleList, ModuleEditDialog } from "@/components/features/modules";
import { LayoutPreview } from "@/components/features/preview";
import { useEditorStore } from "@/stores/editor-store";
import { useLayoutStore } from "@/stores/layout-store";
import { getUserLinks } from "@/actions/link-actions";
import { getModules } from "@/actions/module-actions";
import type { PageModule } from "@/types";

/**
 * Dashboard Page
 * 
 * Main dashboard with module management and real-time preview.
 * Updated to support the new page module system.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 11.1, 11.3, 11.4
 */
export default function DashboardPage() {
    const { data: session } = useSession();
    const { links, theme, setLinks } = useEditorStore();
    const { layout: mobileLayout } = useLayoutStore();
    const [modules, setModules] = useState<PageModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Edit dialog state
    const [editingModule, setEditingModule] = useState<PageModule | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Get user info from session
    const userName = session?.user?.name;
    const userAvatar = session?.user?.image;

    /**
     * Sort modules by layout order (from layout editor)
     * Modules are displayed in the same order as they appear in the layout editor
     */
    const sortedModules = useMemo(() => {
        if (!mobileLayout || mobileLayout.length === 0) {
            return modules;
        }
        // Create a map of module ID to layout Y position for sorting
        const layoutOrder = new Map<string, number>();
        mobileLayout.forEach((item) => {
            layoutOrder.set(item.i, item.y);
        });

        // Sort modules by their Y position in the layout
        return [...modules].sort((a, b) => {
            const aY = layoutOrder.get(a.id) ?? Number.MAX_VALUE;
            const bY = layoutOrder.get(b.id) ?? Number.MAX_VALUE;
            return aY - bY;
        });
    }, [modules, mobileLayout]);

    /**
     * Load modules and links from server on initial mount
     *
     * Requirements: 11.1, 2.2
     */
    const loadData = useCallback(async () => {
        let isMounted = true;

        setIsLoading(true);
        try {
            const [linksResult, modulesResult] = await Promise.all([
                getUserLinks(),
                getModules(),
            ]);

            if (isMounted) {
                if (linksResult.success) {
                    setLinks(linksResult.data);
                }

                if (modulesResult.success) {
                    setModules(modulesResult.data);
                }
            }
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    }, [setLinks]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    /**
     * Handle module creation - add to local state
     */
    const handleModuleCreated = (module: PageModule) => {
        setModules((prev) => [...prev, module]);
    };

    /**
     * Handle module deletion - remove from local state
     */
    const handleModuleDeleted = (moduleId: string) => {
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
    };

    /**
     * Handle module edit - placeholder for future implementation
     */
    const handleModuleEdit = (module: PageModule) => {
        setEditingModule(module);
        setEditDialogOpen(true);
    };

    /**
     * Handle module edit success - refresh module list
     */
    const handleModuleEditSuccess = () => {
        loadData();
    };

    return (
        <div className="flex h-full gap-6">
            {/* Left Side - Module Management */}
            <div className="flex-1 space-y-6 overflow-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">页面管理</h1>
                    <p className="text-muted-foreground">
                        管理你的页面模块和个人主页设置
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">模块数量</CardTitle>
                            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{modules.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {links.length} 个链接
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

                {/* Module Selector */}
                <ModuleSelector onModuleCreated={handleModuleCreated} />

                {/* Module List */}
                {isLoading ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <div className="text-muted-foreground">加载中...</div>
                        </CardContent>
                    </Card>
                ) : (
                    <ModuleList
                        modules={sortedModules}
                        onModuleDeleted={handleModuleDeleted}
                        onModuleEdit={handleModuleEdit}
                    />
                )}
            </div>

            {/* Module Edit Dialog */}
            <ModuleEditDialog
                module={editingModule}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={handleModuleEditSuccess}
            />

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
                                访客看到的页面效果（包含布局编辑）
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center pb-6">
                            <LayoutPreview
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
