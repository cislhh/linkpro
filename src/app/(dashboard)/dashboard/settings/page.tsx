"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Shield } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">账户设置</h1>
                <p className="text-muted-foreground">
                    管理你的账户偏好设置
                </p>
            </div>

            <div className="grid gap-6">
                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <CardTitle>通知设置</CardTitle>
                        </div>
                        <CardDescription>
                            管理通知偏好
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                            <p className="text-sm text-muted-foreground">
                                通知设置功能即将推出
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <CardTitle>安全设置</CardTitle>
                        </div>
                        <CardDescription>
                            管理密码和安全选项
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                            <p className="text-sm text-muted-foreground">
                                安全设置功能即将推出
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
