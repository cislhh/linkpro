"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">账户设置</h1>
                <p className="text-muted-foreground">
                    管理你的账户信息和偏好设置
                </p>
            </div>

            <div className="grid gap-6">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <CardTitle>个人资料</CardTitle>
                        </div>
                        <CardDescription>
                            更新你的个人信息
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">显示名称</Label>
                            <Input id="name" placeholder="你的名字" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bio">个人简介</Label>
                            <Input id="bio" placeholder="简单介绍一下自己" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="avatar">头像 URL</Label>
                            <Input id="avatar" placeholder="https://example.com/avatar.jpg" />
                        </div>
                        <Button>保存更改</Button>
                    </CardContent>
                </Card>

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
