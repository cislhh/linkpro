# LinkPro - Claude 开发指南

> 项目开发准则文档 - 专为本项目的 AI 助手设计

---

## 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [开发规范](#开发规范)
5. [代码风格指南](#代码风格指南)
6. [测试策略](#测试策略)
7. [关键开发注意事项](#关键开发注意事项)
8. [已知问题和解决方案](#已知问题和解决方案)
9. [开发工作流程](#开发工作流程)

---

## 项目概述

**LinkPro** 是一个下一代个人品牌主页生成器，允许开发者和创作者通过拖拽配置，快速创建具有高级动效和个性化设计的社交名片。

### 核心价值主张

- 高视觉冲击力的精美主题（极光 Aurora、赛博 Cyber、玻璃拟态 Glass）
- 实时预览，即时反馈
- 模块化页面系统，支持自定义布局
- 一键部署，生成公开链接

### 产品文档位置

- **需求文档**: `.kiro/specs/linkpro/requirements.md`
- **设计文档**: `.kiro/specs/linkpro/design.md`
- **任务列表**: `.kiro/specs/linkpro/tasks.md`
- **交接文档**: `开发交接文档.md`

---

## 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Next.js | 16.1.1 | App Router + React Server Components |
| React | 19.2.3 | UI 框架 |
| TypeScript | 5 | 类型安全 |

### 样式与 UI

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Tailwind CSS | 4 | 原子化 CSS |
| shadcn/ui | - | 基础 UI 组件（基于 Radix UI） |
| Framer Motion | 12.23.26 | 动画库 |
| Lucide React | 0.562.0 | 图标库 |

### 状态与数据

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Zustand | 5.0.9 | 客户端状态管理 |
| Prisma | 6.19.1 | 类型安全的 ORM |
| PostgreSQL | - | 主数据库 |
| Zod | 4.3.4 | 运行时验证 |

### 认证

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| NextAuth.js | 5.0.0-beta.30 | 认证（Auth.js v5） |
| bcryptjs | 3.0.3 | 密码加密 |

### 拖拽功能

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| react-grid-layout | 2.2.2 | 网格布局编辑器 |
| @dnd-kit/core | 6.3.1 | 拖拽工具 |
| @dnd-kit/sortable | 10.0.0 | 排序功能 |

### 表单处理

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| React Hook Form | 7.69.0 | 表单状态管理 |
| @hookform/resolvers | 5.2.2 | 表单验证集成 |

### 测试

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Vitest | 4.0.16 | 单元测试 |
| fast-check | 4.5.2 | 属性测试 |

### 构建工具

| 技术 | 用途 |
| --- | --- |
| ESLint 9 | 代码质量检查 |
| tsx 4.21.0 | TypeScript 执行 |

---

## 项目结构

```
link-pro/
├── .kiro/                          # 项目规范目录
│   └── specs/linkpro/
│       ├── requirements.md         # 功能需求
│       ├── design.md              # 架构设计
│       ├── tasks.md               # 任务分解
│       └── page-management-fixes.md # Bug 修复记录
│
├── prisma/
│   └── schema.prisma              # 数据库模型
│
├── public/                        # 静态资源
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/               # 认证路由组
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/          # Dashboard 路由组
│   │   │   └── dashboard/
│   │   │       ├── layout-editor/
│   │   │       ├── page-management/
│   │   │       ├── preview/
│   │   │       ├── profile/
│   │   │       ├── settings/
│   │   │       └── themes/
│   │   ├── u/[username]/         # 公开用户页面
│   │   ├── api/auth/[...nextauth]/ # NextAuth API
│   │   ├── layout.tsx
│   │   ├── page.tsx              # 首页
│   │   └── proxy.ts              # 路由保护（Next.js 16）
│   │
│   ├── actions/                   # Server Actions
│   │   ├── link-actions.ts       # 链接 CRUD 操作
│   │   ├── module-actions.ts     # 模块操作
│   │   ├── publish-actions.ts    # 发布/取消发布操作
│   │   └── user-actions.ts       # 用户操作
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 基础组件
│   │   ├── features/             # 业务逻辑组件
│   │   │   ├── dashboard/
│   │   │   ├── layout-editor/
│   │   │   ├── link-editor/
│   │   │   ├── modules/
│   │   │   ├── preview/
│   │   │   ├── publish/
│   │   │   └── theme-selector/
│   │   ├── themes/               # 主题组件
│   │   │   ├── aurora-theme.tsx
│   │   │   ├── cyber-theme.tsx
│   │   │   ├── glass-theme.tsx
│   │   │   └── base-theme.tsx
│   │   └── providers/            # Context 提供者
│   │
│   ├── hooks/                     # 自定义 React Hooks
│   │
│   ├── lib/                       # 工具库
│   │   ├── auth.ts               # NextAuth 配置
│   │   ├── db.ts                 # Prisma 客户端单例
│   │   ├── errors.ts             # 错误类定义
│   │   ├── icon-dictionary.ts    # 图标映射配置
│   │   ├── layout-templates.ts   # 默认布局模板
│   │   ├── utils.ts              # 工具函数
│   │   └── validations.ts        # Zod 验证模式
│   │
│   ├── stores/                    # Zustand 状态管理
│   │   ├── auth-store.ts         # 认证状态（记住我）
│   │   ├── editor-store.ts       # 编辑器状态
│   │   └── layout-store.ts       # 布局状态
│   │
│   ├── types/                     # TypeScript 类型定义
│   │   ├── index.ts              # 主要类型
│   │   └── next-auth.d.ts        # NextAuth 扩展
│   │
│   └── __tests__/                 # 测试文件
│       ├── properties/           # 属性测试
│       └── proxy.test.ts
│
├── components.json                 # shadcn/ui 配置
├── DEPLOYMENT.md                  # 部署文档
├── eslint.config.mjs              # ESLint 配置
├── next.config.ts                 # Next.js 配置
├── package.json                   # 依赖和脚本
├── README.MD                      # 项目概述
├── RULES.MD                       # 开发规则
├── tsconfig.json                  # TypeScript 配置
└── vitest.config.ts               # Vitest 配置
```

---

## 开发规范

### 1. 代码质量原则

#### 类型安全优先

- **禁止使用 `any` 类型** - 使用正确的 TypeScript 类型
- 所有接口必须明确定义
- 在 API 边界使用 Zod 进行运行时验证
- 利用 Prisma 生成的类型

```typescript
// 推荐
interface User {
  id: string;
  email: string;
  username: string;
}

// 不推荐
const user: any = getUser();
```

#### 组件架构

- 单一职责原则 - 一个组件只做一件事
- 可复用组件采用原子设计模式
- 默认使用服务端组件，需要时使用客户端组件
- 仅在必要时使用 "use client" 指令（交互性、hooks、浏览器 API）

```typescript
// 服务端组件（默认）
export default function ProfilePage() {
  return <div>...</div>;
}

// 客户端组件（需要时）
"use client";
export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

#### DRY（不要重复自己）

- 将公共逻辑提取到工具函数
- 使用 Server Actions 处理可复用的变更操作
- 在整个应用中共享 UI 组件
- 在 `lib/validations.ts` 中整合验证模式

### 2. 性能标准

#### Core Web Vitals 目标

- **LCP（最大内容绘制）**: 公开页面 < 1.2s
- **FID（首次输入延迟）**: < 100ms
- **CLS（累积布局偏移）**: < 0.1

#### 动画性能

- 所有动画维持 **60fps**
- 仅使用 CSS `transform` 和 `opacity`（避免触发布局的属性）
- 谨慎使用 `will-change`
- 利用 Framer Motion 的 GPU 加速

```css
/* 推荐 - GPU 加速 */
.animated-element {
  transform: translateX(100px);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

/* 不推荐 - 触发布局 */
.bad-element {
  left: 100px;
  width: 200px;
}
```

#### 代码分割

- 对重量级组件使用动态导入
- 利用 React Server Components 减少客户端 JS
- 优化打包大小（使用 `pnpm run build` 检查）

### 3. 用户体验标准

#### 即时反馈

- 所有用户操作必须在 **200ms** 内提供视觉反馈
- 适当使用 Optimistic UI 更新
- 为异步操作显示加载状态
- 使用 toast 通知（Sonner）显示错误/成功信息

#### 无障碍访问（WCAG AA）

- 所有交互元素必须支持键盘导航
- 颜色对比度必须符合 WCAG AA 标准
- 使用语义化 HTML 元素
- 为自定义组件提供适当的 ARIA 标签
- 禁止嵌套按钮或锚点（HTML 有效性）

```typescript
// 不推荐 - 嵌套按钮
<button onClick={handleClick}>
  <button>内部按钮</button>  // 无效的 HTML
</button>

// 推荐 - 使用正确的结构
<div role="button" onClick={handleClick} tabIndex={0}>
  <span>内部内容</span>
</div>
```

---

## 代码风格指南

### 命名约定

| 类型 | 约定 | 示例 |
| --- | --- | --- |
| 组件 | PascalCase | `LinkForm`, `UserProfile` |
| 函数 | camelCase | `getUserLinks`, `updateProfile` |
| 常量 | UPPER_SNAKE_CASE | `MAX_LINKS_COUNT`, `DEFAULT_THEME` |
| 接口/类型 | PascalCase | `User`, `LinkData` |
| 文件 | kebab-case | `link-form.tsx`, `user-actions.ts` |

### 文件组织

#### 组件文件

```typescript
// 1. 导入（分组并排序）
import { useState } from "react";           // React 在前
import { Button } from "@/components/ui/button";  // 本地导入
import { toast } from "sonner";             // 外部库

// 2. 类型定义
interface MyComponentProps {
  title: string;
  onSubmit: () => void;
}

// 3. 组件实现
export function MyComponent({ title, onSubmit }: MyComponentProps) {
  // Hooks 在前
  const [isLoading, setIsLoading] = useState(false);

  // 事件处理
  const handleSubmit = async () => {
    setIsLoading(true);
    // ...
  };

  // 渲染
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

#### Server Action 文件

```typescript
// 1. 导入
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createLinkSchema } from "@/lib/validations";

// 2. 类型定义
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// 3. Action 实现
export async function createLink(data: CreateLinkInput): Promise<ActionResult<Link>> {
  try {
    // 验证
    const validated = createLinkSchema.parse(data);

    // 认证检查
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "需要认证" };
    }

    // 数据库操作
    const link = await prisma.link.create({
      data: { ...validated, userId: session.user.id },
    });

    return { success: true, data: link };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("createLink error:", error);
    return { success: false, error: "创建链接失败" };
  }
}
```

### TypeScript 配置

**来自 `tsconfig.json` 的关键设置**:

- `strict: true` - 启用所有严格类型检查
- `noUncheckedIndexedAccess: true` - 安全的数组/对象访问
- `noImplicitReturns: true` - 所有代码路径必须返回
- `noFallthroughCasesInSwitch: true` - 显式 break/return
- `forceConsistentCasingInFileNames: true` - 区分大小写的导入

**路径别名**:

- `@/*` 映射到 `./src/*`

### Tailwind CSS 指南

#### 类名顺序

编写类名时使用逻辑顺序：

1. 布局（flex, grid, display）
2. 间距（p-, m-, gap）
3. 尺寸（w-, h-）
4. 排版（text-, font-）
5. 颜色（bg-, text-, border-）
6. 状态（hover:, focus:）
7. 响应式（sm:, md:, lg:）

```tsx
<div className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 md:p-6">
  内容
</div>
```

#### 工具函数

始终使用 `lib/utils.ts` 中的 `cn()` 处理条件类名：

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  "hover:state-classes"
)} />
```

---

## 测试策略

### 测试框架

| 类型 | 工具 | 用途 |
| --- | --- | --- |
| 单元测试 | Vitest | 组件和函数测试 |
| 属性测试 | fast-check | 基于属性的测试（100+ 次迭代） |
| E2E 测试 | Playwright | 完整用户旅程测试 |

### 测试结构

```
src/__tests__/
├── properties/           # 属性测试
│   ├── link.property.test.ts
│   ├── theme.property.test.ts
│   └── user.property.test.ts
├── unit/                # 单元测试（待添加）
│   ├── validations.test.ts
│   └── utils.test.ts
└── e2e/                 # E2E 测试（待添加）
    ├── auth.spec.ts
    └── dashboard.spec.ts
```

### 属性测试要求

**关键**：所有属性测试必须遵循此格式：

```typescript
/**
 * Feature: linkpro, Property X: {属性描述}
 * Validates: Requirements X.X
 */
test("Property X: ...", () => {
  // 属性测试实现
});
```

**每个属性测试最少 100 次迭代**：

```typescript
fc.assert(
  fc.property(fc.string(), fc.string(), (email, password) => {
    // 测试逻辑
  }),
  { numRuns: 100 }  // 最少 100 次迭代
);
```

### 测试命令

```bash
# 运行所有测试（单次）
pnpm run test

# 开发模式（监听）
pnpm run test:watch

# 覆盖率报告
pnpm run test:coverage
```

---

## 关键开发注意事项

### 1. Next.js 16 特性

#### Proxy vs Middleware

**重要**：本项目使用 `src/app/proxy.ts` 进行路由保护，而非 `middleware.ts`

```typescript
// src/app/proxy.ts - 路由保护
export async function GET(request: Request) {
  const { pathname } = new URL(request.url);
  const session = await auth();

  // 受保护路由重定向到登录页
  if (pathname.startsWith("/dashboard") && !session) {
    redirect("/login");
  }

  // 已认证用户从认证页重定向
  if ((pathname === "/login" || pathname === "/register") && session) {
    redirect("/dashboard");
  }

  return null;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
```

#### React Compiler 已启用

项目使用 React Compiler（实验性）进行自动优化：

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactCompiler: true,
};
```

### 2. Server Actions 优先级

**始终使用 Server Actions 处理变更操作**，而非 API 路由：

```typescript
// 推荐 - Server Action
export async function createLink(data: CreateLinkInput) {
  // 直接数据库访问、验证、错误处理
}

// 不推荐 - API 路由
// app/api/links/route.ts
```

### 3. 主题映射

**重要**：确保正确的主题组件映射：

```typescript
// components/themes/index.ts
const themeComponents: Record<ThemeType, React.ComponentType<ThemeProps>> = {
  aurora: AuroraTheme,    // 必须是 AuroraTheme
  glass: GlassTheme,      // 必须是 GlassTheme
  cyber: CyberTheme,      // 必须是 CyberTheme
};
```

### 4. 认证模式

#### 会话管理

- 使用 `@/lib/auth` 中的 `auth()` 获取会话
- 检查 `session?.user?.id` 进行用户识别
- 为认证失败返回结构化错误

```typescript
export async function protectedAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "需要认证" };
  }
  // 继续处理已认证用户
}
```

#### 记住我功能

- Zustand persist 中间件存储到 localStorage
- `auth-store.ts` 管理 rememberMe 状态和 loginExpiry
- AuthGuard 组件在 Dashboard 访问时检查会话有效性

### 5. 数据验证

**始终在 Server Action 边界验证输入**：

```typescript
import { createLinkSchema } from "@/lib/validations";
import { z } from "zod";

export async function createLink(data: unknown) {
  try {
    const validated = createLinkSchema.parse(data);
    // 安全使用验证后的数据
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
  }
}
```

### 6. 错误处理

#### Server Action 模式

```typescript
import { AppError, ValidationError } from "@/lib/errors";

export async function someAction(data: InputType) {
  try {
    // 1. 验证
    const validated = schema.parse(data);

    // 2. 检查认证
    const session = await auth();
    if (!session) throw new AppError("未授权", 401);

    // 3. 执行操作
    const result = await prisma.model.create({ data: validated });

    return { success: true, data: result };
  } catch (error) {
    console.error("Action error:", error);
    return { success: false, error: error.message };
  }
}
```

#### 客户端错误显示

```typescript
import { toast } from "sonner";

const result = await someAction(data);
if (!result.success) {
  toast.error("操作失败", { description: result.error });
} else {
  toast.success("成功！");
}
```

### 7. 图标管理

**使用集中的图标字典**：

```typescript
// lib/icon-dictionary.ts
export const ICON_DICTIONARY = {
  github: { icon: Github, label: "GitHub" },
  twitter: { icon: Twitter, label: "Twitter" },
  // ... 更多图标
};

// 在 IconSelect 组件中
{ICON_DICTIONARY[iconId]?.icon}
```

### 8. 布局系统

#### 移动端与桌面端布局

**重要**：移动端和桌面端布局分开存储：

```typescript
// User 模型
{
  mobileLayout: Json,   // 移动端专用布局
  desktopLayout: Json,  // 桌面端专用布局
}

// 保存布局
const updateData = deviceMode === "mobile"
  ? { mobileLayout: layout }
  : { desktopLayout: layout };
```

#### 布局编辑器约束

- 移动端：固定 375px 宽度，`overflow: hidden`
- 桌面端：响应式宽度，受容器限制

```typescript
// 移动端容器
<div style={{ width: "375px", maxWidth: "375px", overflow: "hidden" }}>
  <LayoutGrid />
</div>
```

### 9. React Hooks 最佳实践

#### useEffect 依赖项规范

**关键规则：避免不稳定的函数依赖**

❌ **错误 - 会导致无限循环**:
```typescript
const { setItems } = useStore(); // Zustand store 函数每次渲染都变化

useEffect(() => {
    setItems(data);
}, [setItems]); // 无限循环！
```

✅ **正确 - 使用稳定的依赖**:
```typescript
const setItems = useStore(state => state.setItems); // 选择器保持稳定

useEffect(() => {
    setItems(data);
}, [data]); // 只依赖实际变化的数据
```

#### useEffect + 异步操作标准模板

**所有 useEffect 中的异步操作必须包含**：

1. `isMounted` 标志 - 防止组件卸载后更新状态
2. `try-catch` - 捕获错误防止崩溃
3. `finally` 块 - 确保加载状态正确更新
4. cleanup 函数 - 清理副作用

```typescript
useEffect(() => {
    let isMounted = true;

    async function loadData() {
        try {
            setIsLoading(true);
            const result = await fetchSomething();

            if (isMounted) {
                setData(result);
            }
        } catch (error) {
            console.error("Load failed:", error);
            if (isMounted) {
                setError(error.message);
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    }

    loadData();

    return () => {
        isMounted = false; // 清理标志
    };
}, [/* 稳定的依赖 */]);
```

#### 防重复加载模式

对于只需要执行一次的副作用：

```typescript
const hasLoaded = useRef(false);

useEffect(() => {
    if (hasLoaded.current) return;

    hasLoaded.current = true;
    // 执行一次性逻辑...
}, [/* 依赖 */]);
```

#### Zustand Store 使用规范

**❌ 错误 - 直接解构会导致引用变化**:
```typescript
const { items, setItems } = useStore();

useEffect(() => {
    setItems(data);
}, [setItems]); // 无限循环
```

**✅ 正确 - 选择性订阅**:
```typescript
// 方式1: 使用选择器
const items = useStore(state => state.items);
const setItems = useStore(state => state.setItems);

// 方式2: 使用单独的 hooks（如果已定义）
const items = useItems();
const setItems = useSetItems();

// 方式3: 浅层比较（避免对象引用变化）
const { items } = useStore(
    (state) => ({ items: state.items }),
    shallowEqual
);
```

**Zustand Store 函数必须是稳定的**:

```typescript
// ✅ 正确 - 导出稳定的函数引用
export const useLayoutStore = create<LayoutState>((set, get) => ({
  modules: [],
  setModules: async (modules: Module[]) => {
    // 实现中添加 try-catch
  },
}));

// 组件中使用
const setModules = useLayoutStore(state => state.setModules);
```

#### Server Action 调用规范

在 Store 中调用 Server Action 时必须添加错误处理：

```typescript
// ✅ 正确
setModules: async (modules: Module[]) => {
    try {
        const layoutsResult = await getDeviceLayouts().catch(() => ({ success: false }));

        if (layoutsResult.success) {
            // 处理成功情况
        } else {
            // 使用默认值
        }

        set({ modules, layout: defaultLayout });
    } catch (error) {
        console.error("setModules error:", error);
        // 失败时使用默认布局，不抛出异常
        set({ modules, layout: generateDefaultLayout(modules) });
    }
}
```

---

## 已知问题和解决方案

### 0. useEffect 无限循环导致应用卡死 (已修复)

**问题**: 应用启动后完全无响应，白屏，无法交互
**日期**: 2025-01-11
**严重程度**: 严重

**原因**:
- `layout-preview.tsx` 的 useEffect 依赖项包含 `setModules`（Zustand store 函数）
- Zustand store 函数每次渲染都会变化，导致无限循环
- 无限触发 Server Actions 调用，最终导致应用卡死

**解决方案**:
- 移除 `setModules` 从 useEffect 依赖项
- 添加 `hasLoaded` ref 防止重复加载
- 在 Store 中添加 try-catch 错误处理
- 详见 `DevelopmentDoc/2025-01-11-infinite-loop-fix.md`

### 1. 主题渲染 Bug

**问题**: Aurora 和 Glass 主题被交换了
**解决方案**: 已在 `components/themes/index.ts` 中修复 - 验证映射是否正确

### 2. 长效会话 Bug

**问题**: 非"记住我"会话在浏览器重启后仍然存在
**状态**: `设计.md` 中有记录的修复方案，需要验证实现
**解决方案**: 使用 `sessionStorage` 检测浏览器关闭

### 3. HTML 有效性 - 嵌套按钮

**问题**: 嵌套的 `<button>` 元素违反 HTML 规范
**解决方案**: 对嵌套的交互元素使用 `role="button"` 的 `<div>`

```typescript
// 不推荐
<button onClick={outerAction}>
  <button onClick={innerAction}>点击</button>
</button>

// 推荐
<div role="button" onClick={outerAction} tabIndex={0}>
  <button onClick={innerAction}>点击</button>
</div>
```

### 4. 布局数据分离

**问题**: 移动端/桌面端布局相互影响
**状态**: 已在 Prisma schema 中修复，使用独立的 `mobileLayout` 和 `desktopLayout` 字段

### 5. 模块编辑

**问题**: 页面管理中的编辑按钮不工作
**状态**: `page-management-fixes.md` 中有记录
**解决方案**: 实现 `ModuleEditDialog` 组件

---

## 开发文档记录规范

### 开发文档规则

**重要**：每次进行功能开发、Bug 修复或代码重构时，必须创建详细的开发文档。

#### 文档要求

1. **文档位置**：`/DevelopmentDoc` 目录
2. **文件命名**：`YYYY-MM-DD-功能描述.md`（如 `2025-01-15-profile-page-refactoring.md`）
3. **文档格式**：参考现有文档格式，必须包含以下章节：
   - 概述（日期、开发者、项目）
   - 需求分析
   - 技术设计（数据库、类型定义、接口设计等）
   - 实现细节（代码示例、开发要点）
   - 问题与解决方案
   - 技术要点总结
   - 文件清单

#### 文档模板

```markdown
# 功能名称 - 完整开发文档

## 概述

本文档记录了 [功能描述] 的完整开发过程，包括需求分析、技术设计、实现细节以及遇到的问题和解决方案。

**开发日期**: YYYY-MM-DD
**开发者**: Claude AI
**项目**: LinkPro

---

## 目录

1. [需求分析](#需求分析)
2. [技术设计](#技术设计)
3. [实现细节](#实现细节)
4. [问题与解决方案](#问题与解决方案)
5. [技术要点总结](#技术要点总结)
6. [文件清单](#文件清单)

---
```

#### 记录时机

- ✅ 功能开发开始前：记录需求分析和技术设计
- ✅ 开发过程中：记录遇到的问题和解决方案
- ✅ 开发完成后：整理完整文档，补充实现细节和总结
- ✅ Bug 修复时：记录问题原因、修复步骤和预防措施

#### 文档内容要求

1. **代码示例**：关键代码必须包含完整示例
2. **问题记录**：详细记录问题原因、表现和解决方案
3. **最佳实践**：总结 DO/DON'T 模式
4. **文件清单**：列出所有新建和修改的文件

#### 参考文档

- `/DevelopmentDoc/2025-01-15-profile-page-refactoring.md` - 个人资料页面重构文档

---

## 开发工作流程

### 1. 初始设置

```bash
# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env
# 编辑 .env 填入你的值

# 初始化数据库
npx prisma migrate dev
pnpm run db:seed

# 启动开发服务器
pnpm run dev
```

### 2. 数据库操作

```bash
# 创建迁移
npx prisma migrate dev --name migration_name

# 重置数据库（破坏性）
pnpm run db:reset

# 填充数据库
pnpm run db:seed

# 打开 Prisma Studio
npx prisma studio
```

### 3. 构建和部署

```bash
# 类型检查
npx tsc --noEmit

# 代码检查
pnpm run lint

# 构建生产包
pnpm run build

# 本地运行生产服务器
pnpm run start
```

### 4. Vercel 部署

项目配置为 Vercel 部署：
- 从 `master` 分支自动部署
- 在 Vercel 仪表板中配置环境变量
- 通过 Vercel Postgres 或外部提供商提供 PostgreSQL 数据库

详情参见 `DEPLOYMENT.md` 和 `ONE_CLICK_DEPLOY.md`。

---

## 快速参考

### 常用命令

```bash
pnpm run dev          # 启动开发服务器 (http://localhost:3000)
pnpm run build        # 构建生产版本
pnpm run lint         # 运行 ESLint
pnpm run test         # 运行所有测试
pnpm run test:watch   # 测试监听模式
pnpm run db:seed      # 填充数据库
pnpm run db:reset     # 重置数据库
```

### 重要文件位置

| 用途 | 文件路径 |
| --- | --- |
| 数据库模型 | `prisma/schema.prisma` |
| 验证模式 | `src/lib/validations.ts` |
| 认证配置 | `src/lib/auth.ts` |
| 路由保护 | `src/app/proxy.ts` |
| 主题映射 | `src/components/themes/index.ts` |
| 图标字典 | `src/lib/icon-dictionary.ts` |
| 布局模板 | `src/lib/layout-templates.ts` |

### 关键环境变量

```env
DATABASE_URL="postgresql://..."          # 必需
AUTH_SECRET="your-secret-key"            # 必需
NEXTAUTH_URL="http://localhost:3000"     # 必需
```

---

## 附录

### 模块类型参考

| 类型 | 描述 | 数据结构 |
| --- | --- | --- |
| `links` | 社交链接列表 | `{ type: 'links', links: Link[] }` |
| `bio` | 个人简介 | `{ type: 'bio', name, bio, avatarUrl }` |
| `skills` | 技能标签 | `{ type: 'skills', skills: string[] }` |
| `projects` | 项目展示 | `{ type: 'projects', projects: Project[] }` |

### 主题参考

| 主题 ID | 组件 | 视觉风格 |
| --- | --- | --- |
| `aurora` | `AuroraTheme` | 动画渐变背景 |
| `cyber` | `CyberTheme` | 霓虹边框和发光效果 |
| `glass` | `GlassTheme` | 背景模糊和 3D 倾斜 |

### Server Actions 索引

| 文件 | Actions |
| --- | --- |
| `link-actions.ts` | `createLink`, `updateLink`, `deleteLink`, `reorderLinks`, `getUserLinks` |
| `user-actions.ts` | `registerUser`, `updateUserProfile`, `updateUserTheme` |
| `module-actions.ts` | `createModule`, `updateModule`, `deleteModule`, `getModules`, `saveLayout` |
| `publish-actions.ts` | `publishPage`, `unpublishPage`, `getPublishStatus` |

---

## 文档版本

**版本**: 1.0.0
**最后更新**: 2026-01-11
**维护者**: LinkPro 开发团队

---

## 更新日志

| 版本 | 日期 | 变更 |
| --- | --- | --- |
| 1.1.0 | 2025-01-11 | 添加 React Hooks 最佳实践和 useEffect 规范；记录无限循环问题修复 |
| 1.0.0 | 2026-01-11 | 初始 CLAUDE.md 创建 |
