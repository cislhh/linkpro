"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid3X3, Save, Eye, Loader2, Smartphone, LayoutGrid as LayoutGridIcon } from "lucide-react";
import { LayoutGrid } from "@/components/features/layout-editor";
import { PageHeader } from "@/components/features/dashboard";
import { useLayoutStore } from "@/stores/layout-store";
import { getModules } from "@/actions/module-actions";
import { getUserLinks } from "@/actions/link-actions";
import { getUserProfile } from "@/actions/user-actions";
import type { PageModule, Link as LinkType, Project } from "@/types";
import { toast } from "sonner";

/**
 * Layout Editor Page
 * 
 * Drag-and-drop layout editor for customizing page module positions and sizes.
 * Uses react-grid-layout for grid-based layout management.
 * Mobile-only mode - optimized for mobile devices.
 * Always in edit mode - no mode toggle needed.
 * 
 * Requirements: 12.1, 12.2, 12.3
 * Requirements: 23.1, 23.2, 23.3 - Simplified interaction (always editable)
 */
export default function LayoutEditorPage() {
    const { data: session } = useSession();
    const [modules, setModules] = useState<PageModule[]>([]);
    const [links, setLinks] = useState<LinkType[]>([]);
    const [userProjects, setUserProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const {
        setModules: setStoreModules,
        saveLayout,
    } = useLayoutStore();

    // Load modules and links on mount
    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            if (!session?.user?.id) return;

            try {
                setIsLoading(true);
                const [modulesResult, linksResult, profileResult] = await Promise.all([
                    getModules(),
                    getUserLinks(),
                    getUserProfile(),
                ]);

                if (isMounted) {
                    if (modulesResult.success) {
                        setModules(modulesResult.data);
                        // setStoreModules is now async
                        await setStoreModules(modulesResult.data);
                    }

                    if (linksResult.success) {
                        setLinks(linksResult.data);
                    }

                    if (profileResult.success && profileResult.data.projects) {
                        setUserProjects(profileResult.data.projects);
                    }
                }
            } catch (error) {
                console.error("Failed to load data:", error);
                if (isMounted) {
                    toast.error("加载数据失败");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            isMounted = false;
        };
    }, [session?.user?.id, setStoreModules]);

    // Handle save layout
    const handleSave = async () => {
        try {
            setIsSaving(true);
            await saveLayout();
            toast.success("布局已保存");
        } catch (error) {
            console.error("Failed to save layout:", error);
            toast.error("保存布局失败");
        } finally {
            setIsSaving(false);
        }
    };

    // Mobile-only: 2 columns
    const gridCols = 2;

    return (
        <div className="space-y-6">
            <PageHeader
                title="布局编辑"
                description="拖拽模块自定义页面布局"
                icon={LayoutGridIcon}
                actions={
                    <>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/preview">
                                <Eye className="h-4 w-4 mr-2" />
                                预览效果
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            保存布局
                        </Button>
                    </>
                }
            />

            {/* Mobile Mode Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <Smartphone className="h-4 w-4" />
                <span>移动端布局 - 2列网格，适合手机屏幕</span>
            </div>

            <Card className="layout-grid-container">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Grid3X3 className="h-5 w-5" />
                        <CardTitle>布局编辑器</CardTitle>
                    </div>
                    <CardDescription>
                        拖拽模块调整位置，拖拽角落调整大小
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <LayoutGrid
                            modules={modules}
                            links={links}
                            userProjects={userProjects}
                            isEditing={true}
                            cols={gridCols}
                        />
                    )}
                </CardContent>
            </Card>

            <Card className="bg-muted/50">
                <CardContent className="py-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-primary/20 border-2 border-dashed border-primary" />
                            <span>拖拽占位符</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-sm bg-primary" />
                            <span>调整大小手柄</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
