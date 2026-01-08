"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3, Construction } from "lucide-react";

/**
 * Layout Editor Page
 * 
 * Placeholder page for the drag-and-drop layout editor.
 * Will be implemented in Phase 12.
 * 
 * Requirements: 12.1
 */
export default function LayoutEditorPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">布局编辑</h1>
                <p className="text-muted-foreground">
                    拖拽模块自定义页面布局
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Grid3X3 className="h-5 w-5" />
                        <CardTitle>布局编辑器</CardTitle>
                    </div>
                    <CardDescription>
                        通过拖拽调整模块位置和大小
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 rounded-full bg-muted p-4">
                            <Construction className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium">功能开发中</h3>
                        <p className="max-w-md text-sm text-muted-foreground">
                            布局编辑器正在开发中，即将推出。届时你可以通过拖拽来自定义模块的位置和大小。
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
