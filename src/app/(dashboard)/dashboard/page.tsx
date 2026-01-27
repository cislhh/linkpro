"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Eye, Palette, ExternalLink } from "lucide-react";
import { ModuleSelector, ModuleList, ModuleEditDialog } from "@/components/features/modules";
import { PageHeader } from "@/components/features/dashboard";
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
    const { theme, setLinks } = useEditorStore();
    const { layout: mobileLayout } = useLayoutStore();
    const [modules, setModules] = useState<PageModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Edit dialog state
    const [editingModule, setEditingModule] = useState<PageModule | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

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
        const isMounted = { current: true };

        setIsLoading(true);
        try {
            const [linksResult, modulesResult] = await Promise.all([
                getUserLinks(),
                getModules(),
            ]);

            if (isMounted.current) {
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
            if (isMounted.current) {
                setIsLoading(false);
            }
            isMounted.current = false;
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
        <div className="h-full space-y-6">
            {/* Page Header with Stats Pills */}
            <PageHeader
                title="页面管理"
                description="管理你的页面模块和个人主页设置"
                icon={LayoutGrid}
                stats={[
                    {
                        icon: LayoutGrid,
                        label: "模块",
                        value: modules.length
                    },
                    {
                        icon: Palette,
                        label: "主题",
                        value: theme
                    }
                ]}
                actions={
                    <Button asChild variant="default" size="lg" className="gap-2 shadow-lg shadow-primary/20">
                        <a href="/dashboard/preview">
                            <Eye className="h-4 w-4" />
                            预览页面
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </Button>
                }
            />

            {/* Module Management */}
            <div className="space-y-6 overflow-auto">

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
        </div>
    );
}
