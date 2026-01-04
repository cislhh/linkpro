"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">预览页面</h1>
                    <p className="text-muted-foreground">
                        实时预览你的个人主页效果
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Monitor className="mr-2 h-4 w-4" />
                        桌面端
                    </Button>
                    <Button variant="outline" size="sm">
                        <Smartphone className="mr-2 h-4 w-4" />
                        移动端
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        <CardTitle>实时预览</CardTitle>
                    </div>
                    <CardDescription>
                        这里将显示你的公开页面预览
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed bg-muted/50">
                        <div className="text-center">
                            <Eye className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4 text-sm text-muted-foreground">
                                实时预览组件将在后续任务中实现
                            </p>
                            <p className="text-xs text-muted-foreground">
                                (Task 14: 实时预览功能)
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
