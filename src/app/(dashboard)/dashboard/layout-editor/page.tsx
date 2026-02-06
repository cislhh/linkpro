"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid3X3, Save, Eye, Loader2, Smartphone } from "lucide-react";
import { LayoutGrid } from "@/components/features/layout-editor";
import { PhoneFrame, PhoneFrameContent } from "@/components/ui/phone-frame";
import { useLayoutStore } from "@/stores/layout-store";
import { useEditorStore } from "@/stores/editor-store";
import { useUserStore } from "@/stores/user-store";
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
    const [isSaving, setIsSaving] = useState(false);

    // Read from stores instead of fetching data
    const { modules: storeModules, saveLayout } = useLayoutStore();
    const { links } = useEditorStore();
    const { projects } = useUserStore();

    // Check if data is loaded from DataProvider
    const isLoading = storeModules.length === 0 && links.length === 0;

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">布局编辑</h1>
                    <p className="text-muted-foreground">
                        拖拽模块自定义页面布局
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Preview Page Link */}
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/preview">
                            <Eye className="h-4 w-4 mr-2" />
                            预览效果
                        </Link>
                    </Button>

                    {/* Save Button */}
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
                </div>
            </div>

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
                        <div className="flex justify-center">
                            <PhoneFrame variant="bordered-only">
                                <PhoneFrameContent paddingTop="50px" paddingBottom="24px">
                                    <LayoutGrid
                                        modules={storeModules}
                                        links={links}
                                        userProjects={projects || []}
                                        isEditing={true}
                                        cols={gridCols}
                                    />
                                </PhoneFrameContent>
                            </PhoneFrame>
                        </div>
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
