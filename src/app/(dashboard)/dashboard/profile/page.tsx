"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Link2, FolderGit2, UserCircle } from "lucide-react";
import { LinkList } from "@/components/features/link-editor";
import { ProjectList } from "@/components/features/project-editor";
import { ProfileForm } from "@/components/features/profile";
import { PageHeader, DashboardCard } from "@/components/features/dashboard";
import { useEditorStore } from "@/stores/editor-store";
import { getUserLinks } from "@/actions/link-actions";
import { getUserProfile } from "@/actions/user-actions";
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
  const setLinks = useEditorStore((state) => state.setLinks);
  const setUser = useUserStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);

  // Load links on mount
  useEffect(() => {
    let isMounted = true;

    async function loadUserData() {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);

        // 并行加载 links 和用户资料
        const [linksResult, profileResult] = await Promise.all([
          getUserLinks(),
          getUserProfile(),
        ]);

        if (isMounted) {
          // 更新 links 到 editor-store
          if (linksResult.success) {
            setLinks(linksResult.data);
          }

          // 更新 profile 和 projects 到 user-store
          if (profileResult.success) {
            const { name, bio, avatarUrl, phone, contact, projects } =
              profileResult.data;
            setUser({
              profile: { name, bio, avatarUrl, phone, contact },
              projects: projects || [],
            });
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, setLinks, setUser]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="个人信息"
        description="管理个人资料和链接"
        icon={UserCircle}
      />

      <div className="grid gap-6">
        {/* Profile Form */}
        <ProfileForm />

        {/* Account Info Card */}
        <DashboardCard
          icon={Link2}
          title="账户信息"
          description="您的账户基本信息（不可修改）"
          variant="default"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm font-medium">用户名</span>
              <span className="text-sm text-muted-foreground font-mono">
                @{session?.user?.username || "未设置"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">邮箱</span>
              <span className="text-sm text-muted-foreground">
                {session?.user?.email || "未设置"}
              </span>
            </div>
          </div>
        </DashboardCard>

        {/* Link Management Card */}
        {isLoading ? (
          <DashboardCard
            icon={Link2}
            title="链接管理"
            description="添加、编辑和管理您的社交链接"
          >
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          </DashboardCard>
        ) : (
          <DashboardCard
            icon={Link2}
            title="链接管理"
            description="添加、编辑和管理您的社交链接"
          >
            <LinkList />
          </DashboardCard>
        )}

        {/* Project Management Card */}
        <DashboardCard
          icon={FolderGit2}
          title="项目管理"
          description="添加、编辑和管理您的个人项目"
        >
          <ProjectList />
        </DashboardCard>
      </div>
    </div>
  );
}
