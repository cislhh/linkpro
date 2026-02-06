"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    Palette,
    Eye,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User,
    ExternalLink,
    Link2,
    UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { PublishButton, PublishStatus } from "@/components/features/publish";

interface SidebarProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
}

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

/**
 * Navigation items for the dashboard sidebar
 *
 * Layout editor has been removed - layout is now managed automatically
 *
 * Requirements: 11.1
 */
const navItems: NavItem[] = [
    {
        href: "/dashboard",
        label: "页面管理",
        icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
        href: "/dashboard/profile",
        label: "个人信息",
        icon: <UserCircle className="h-5 w-5" />,
    },
    {
        href: "/dashboard/themes",
        label: "主题设置",
        icon: <Palette className="h-5 w-5" />,
    },
    {
        href: "/dashboard/preview",
        label: "预览页面",
        icon: <Eye className="h-5 w-5" />,
    },
    {
        href: "/dashboard/settings",
        label: "账户设置",
        icon: <Settings className="h-5 w-5" />,
    },
];

export function DashboardSidebar({ collapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <aside
            className={cn(
                "flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo / Brand */}
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Link2 className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-semibold text-sidebar-foreground">
                            LinkPro
                        </span>
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onToggleCollapse}
                    className="text-sidebar-foreground hover:bg-sidebar-accent"
                    aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                collapsed && "justify-center px-2"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            {item.icon}
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Public Page Link */}
            {session?.user?.username && (
                <div className="border-t border-sidebar-border p-2">
                    <Link
                        href={`/u/${session.user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? "查看公开页面" : undefined}
                    >
                        <ExternalLink className="h-5 w-5" />
                        {!collapsed && <span>查看公开页面</span>}
                    </Link>
                </div>
            )}

            {/* Publish Section */}
            {!collapsed && (
                <div className="border-t border-sidebar-border p-3">
                    <div className="mb-2">
                        <PublishStatus />
                    </div>
                    <PublishButton />
                </div>
            )}

            {/* User Section */}
            <div className="border-t border-sidebar-border p-2">
                {/* User Info */}
                <div
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
                        <User className="h-4 w-4 text-sidebar-accent-foreground" />
                    </div>
                    {!collapsed && session?.user && (
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium text-sidebar-foreground">
                                {session.user.name || session.user.email}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                @{session.user.username}
                            </p>
                        </div>
                    )}
                </div>

                {/* Sign Out Button */}
                <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className={cn(
                        "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? "退出登录" : undefined}
                >
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span>退出登录</span>}
                </Button>
            </div>
        </aside>
    );
}
