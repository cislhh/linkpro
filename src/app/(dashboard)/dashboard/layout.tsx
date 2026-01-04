import { redirect } from "next/navigation";
import { isAuthenticated } from "@/app/proxy";
import { DashboardLayoutClient } from "./layout-client";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

/**
 * Dashboard 服务器端布局
 * 使用 proxy 模式进行路由保护
 * 
 * Requirements: 9.1, 9.3, 9.5
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    // 执行路由保护 - 未登录用户将被重定向到登录页
    const authenticated = await isAuthenticated();

    if (!authenticated) {
        // 重定向到登录页，保留 callbackUrl
        redirect("/login?callbackUrl=/dashboard");
    }

    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
