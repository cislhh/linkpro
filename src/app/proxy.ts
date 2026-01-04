import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Next.js 16 Proxy 路由保护
 * 
 * 替代已废弃的 middleware.ts 文件
 * 使用 proxy 文件约定实现路由级别的认证保护
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

// 定义需要保护的路由
const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login", "/register"];

export type ProxyCheckResult = {
  shouldRedirect: boolean;
  redirectTo?: string;
};

/**
 * 检查受保护路由的访问权限
 * 用于 Dashboard 布局中保护需要认证的页面
 * 
 * @param pathname - 当前访问的路径
 * @returns 重定向信息或 null（允许访问）
 */
export async function checkProtectedRoute(
  pathname: string
): Promise<ProxyCheckResult> {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // 规则1: 未登录用户访问受保护路由 → 重定向到登录页
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return {
      shouldRedirect: true,
      redirectTo: `/login?callbackUrl=${callbackUrl}`,
    };
  }

  return { shouldRedirect: false };
}


/**
 * 检查认证页面的访问权限
 * 用于登录/注册页面布局中防止已登录用户访问
 * 
 * @param pathname - 当前访问的路径
 * @returns 重定向信息或 null（允许访问）
 */
export async function checkAuthRoute(
  pathname: string
): Promise<ProxyCheckResult> {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // 规则2: 已登录用户访问认证页面 → 重定向到 Dashboard
  if (authRoutes.some(route => pathname.startsWith(route)) && isLoggedIn) {
    return {
      shouldRedirect: true,
      redirectTo: "/dashboard",
    };
  }

  return { shouldRedirect: false };
}

/**
 * 执行路由保护检查并在需要时重定向
 * 这是一个便捷函数，结合检查和重定向操作
 * 
 * @param pathname - 当前访问的路径
 * @param type - 路由类型: 'protected' 或 'auth'
 */
export async function enforceRouteProtection(
  pathname: string,
  type: "protected" | "auth"
): Promise<void> {
  const result = type === "protected" 
    ? await checkProtectedRoute(pathname)
    : await checkAuthRoute(pathname);

  if (result.shouldRedirect && result.redirectTo) {
    redirect(result.redirectTo);
  }
}

/**
 * 获取当前用户会话
 * 便捷函数用于在服务器组件中获取认证状态
 */
export async function getSession() {
  return await auth();
}

/**
 * 检查用户是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}
