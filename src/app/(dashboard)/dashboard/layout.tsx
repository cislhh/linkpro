"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/features/dashboard/sidebar";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
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
    );
}
