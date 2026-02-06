"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link2, FolderGit2 } from "lucide-react";
import { LinkList } from "@/components/features/link-editor";
import { ProjectList } from "@/components/features/project-editor";
import { ProfileForm } from "@/components/features/profile";
import { useEditorStore } from "@/stores/editor-store";
import { useUserStore } from "@/stores/user-store";
/**
 * Profile Page - Personal Information Management
 *
 * Manages personal information and links.
 * Uses ProfileForm for profile editing and LinkList for link management.
 *
 * Requirements: Profile editing, Link management
 */
export default function ProfilePage() {
  const { data: session } = useSession();
  const { links } = useEditorStore();
  const { profile } = useUserStore();

  // Check if data is loaded from DataProvider
  const isDataLoaded = profile.name !== null || profile.name !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">个人信息</h1>
        <p className="text-muted-foreground">管理个人资料和链接</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Form */}
        <ProfileForm />

        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              <CardTitle>账户信息</CardTitle>
            </div>
            <CardDescription>您的账户基本信息（不可修改）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">用户名：</span>
                <span className="text-sm text-muted-foreground">
                  @{session?.user?.username || "未设置"}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">邮箱：</span>
                <span className="text-sm text-muted-foreground">
                  {session?.user?.email || "未设置"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Link Management Card */}
        {!isDataLoaded && links.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">加载中...</div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                <CardTitle>链接管理</CardTitle>
              </div>
              <CardDescription>添加、编辑和管理您的社交链接</CardDescription>
            </CardHeader>
            <CardContent>
              <LinkList />
            </CardContent>
          </Card>
        )}

        {/* Project Management Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5" />
              <CardTitle>项目管理</CardTitle>
            </div>
            <CardDescription>添加、编辑和管理您的个人项目</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
