"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

export default function ThemesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">主题设置</h1>
                <p className="text-muted-foreground">
                    选择你喜欢的主题风格
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Aurora Theme */}
                <Card className="cursor-pointer transition-all hover:ring-2 hover:ring-primary">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            <CardTitle>Aurora</CardTitle>
                        </div>
                        <CardDescription>极光渐变动效背景</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-32 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-80" />
                    </CardContent>
                </Card>

                {/* Cyber Theme */}
                <Card className="cursor-pointer transition-all hover:ring-2 hover:ring-primary">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            <CardTitle>Cyber</CardTitle>
                        </div>
                        <CardDescription>霓虹边框发光特效</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-32 rounded-lg bg-gray-900 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
                    </CardContent>
                </Card>

                {/* Glass Theme */}
                <Card className="cursor-pointer transition-all hover:ring-2 hover:ring-primary">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            <CardTitle>Glass</CardTitle>
                        </div>
                        <CardDescription>玻璃拟态 3D 效果</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-32 rounded-lg bg-white/20 backdrop-blur-md border border-white/30" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>主题预览</CardTitle>
                    <CardDescription>
                        主题选择器将在后续任务中完善
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground">
                            完整主题预览功能即将推出
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
