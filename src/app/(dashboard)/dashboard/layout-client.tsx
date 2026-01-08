"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/features/dashboard/sidebar";
import { AuthGuard } from "@/components/providers/auth-guard";

interface DashboardLayoutClientProps {
    children: React.ReactNode;
}

/**
 * Dashboard 客户端布局组件
 * 处理侧边栏状态和 UI 交互
 * 包含 AuthGuard 用于检查会话有效性（记住我功能）
 */
export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <AuthGuard>
            <div className="flex h-screen bg-background">
                {/* Sidebar */}
                <DashboardSidebar
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    <div className="h-full p-6">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
