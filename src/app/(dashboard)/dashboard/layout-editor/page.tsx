"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid3X3, Save, Edit, Eye, Loader2 } from "lucide-react";
import { LayoutGrid } from "@/components/features/layout-editor";
import { useLayoutStore } from "@/stores/layout-store";
import { getModules } from "@/actions/module-actions";
import { getUserLinks } from "@/actions/link-actions";
import type { PageModule, Link } from "@/types";
import { toast } from "sonner";

/**
 * Layout Editor Page
 * 
 * Drag-and-drop layout editor for customizing page module positions and sizes.
 * Uses react-grid-layout for grid-based layout management.
 * 
 * Requirements: 12.1, 12.2, 12.3
 */
export default function LayoutEditorPage() {
    const { data: session } = useSession();
    const [modules, setModules] = useState<PageModule[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { setModules: setStoreModules, saveLayout, isEditing, toggleEditing } = useLayoutStore();

    // Load modules and links on mount
    useEffect(() => {
        async function loadData() {
            if (!session?.user?.id) return;

            try {
                setIsLoading(true);
                const [modulesResult, linksResult] = await Promise.all([
                    getModules(),
                    getUserLinks(),
                ]);

                if (modulesResult.success) {
                    setModules(modulesResult.data);
                    setStoreModules(modulesResult.data);
                }

                if (linksResult.success) {
                    setLinks(linksResult.data);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
                toast.error("加载数据失败");
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">布局编辑</h1>
                    <p className="text-muted-foreground">
                        拖拽模块自定义页面布局
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={isEditing ? "default" : "outline"}
                        size="sm"
                        onClick={toggleEditing}
                    >
                        {isEditing ? (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                预览模式
                            </>
                        ) : (
                            <>
                                <Edit className="h-4 w-4 mr-2" />
                                编辑模式
                            </>
                        )}
                    </Button>

                    {isEditing && (
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
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Grid3X3 className="h-5 w-5" />
                        <CardTitle>布局编辑器</CardTitle>
                    </div>
                    <CardDescription>
                        {isEditing
                            ? "拖拽模块调整位置，拖拽角落调整大小"
                            : "点击「编辑模式」开始编辑布局"}
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
                            isEditing={isEditing}
                        />
                    )}
                </CardContent>
            </Card>

            {isEditing && (
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
            )}
        </div>
    );
}
