import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  
  // ========== 认证状态检查 ==========
  // req.auth 包含当前用户的 session 信息
  // 如果用户已登录，req.auth 会有值；未登录则为 null/undefined
  const isLoggedIn = !!req.auth;

  // ========== 路由类型判断 ==========
  // 认证页面：登录和注册页面
  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  // 受保护页面：Dashboard 及其所有子路由
  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");

  // ========== 路由保护逻辑 ==========
  
  // 规则1: 已登录用户访问认证页面 → 重定向到 Dashboard
  // 防止已登录用户重复登录
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 规则2: 未登录用户访问 Dashboard → 重定向到登录页
  // 【这里是 Dashboard 保护的核心逻辑】
  // 如果想临时禁用保护进行测试，可以注释掉下面这个 if 块
  if (isDashboardPage && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    // 保存原始访问路径，登录后可以跳转回来
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 其他情况：允许访问
  return NextResponse.next();
});

// ========== Middleware 匹配配置 ==========
// 只有匹配这些路径的请求才会经过上面的 middleware 处理
// :path* 表示匹配所有子路径，如 /dashboard/themes, /dashboard/settings 等
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
