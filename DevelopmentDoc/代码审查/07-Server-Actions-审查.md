# Server Actions 代码审查报告

## 概述

本报告审查 LinkPro 项目中 Server Actions 的实现，重点关注性能、安全性和最佳实践。

**审查日期**: 2026-01-29
**审查范围**: `src/actions/` 目录

---

## 目录

1. [module-actions.ts](#module-actionsts)
2. [link-actions.ts](#link-actionsts)
3. [user-actions.ts](#user-actionsts)
4. [publish-actions.ts](#publish-actionsts)
5. [upload-actions.ts](#upload-actionsts)

---

## module-actions.ts

### 文件信息
- **路径**: `src/actions/module-actions.ts`
- **行数**: 487 行 (最大的 action 文件)
- **状态**: ⚠️ 需要改进

### 问题分析

#### 1. ⚠️ 文件过大 - 需要拆分

**问题**: 487 行代码，包含多个模块相关的 actions

**建议拆分**:
```
src/actions/modules/
├── index.ts (导出所有 actions)
├── crud.ts (getModules, createModule, updateModule, deleteModule)
├── layout.ts (saveLayout, saveDeviceLayout, getDeviceLayouts)
└── utils.ts (clearSkillsModules 等工具函数)
```

#### 2. ✅ 良好的认证和验证模式

```typescript
export async function createModule(data: CreateModuleInput): Promise<ActionResult<PageModule>> {
  try {
    // 1. Validate input using Zod schema
    const validated = createModuleSchema.parse(data);

    // 2. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 3. Type validation
    if (validated.data.type !== validated.type) {
      return { success: false, error: "..." };
    }

    // 4. Database operation
    const module = await prisma.pageModule.create({ /* ... */ });

    return { success: true, data: typedModule };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    console.error("createModule error:", error);
    return { success: false, error: "Failed to create module" };
  }
}
```

**评价**: ✅ 正确的模式
1. 输入验证
2. 认证检查
3. 类型验证
4. 数据库操作
5. 错误处理

#### 3. ⚠️ 批量更新性能问题

**问题** (第 313-326 行):
```typescript
export async function saveLayout(layoutItems: LayoutItem[]): Promise<ActionResult<PageModule[]>> {
  // ...

  // 5. Batch update all modules in a transaction
  const updatePromises = validated.map((item) =>
    prisma.pageModule.update({
      where: { id: item.id },
      data: {
        gridX: item.gridX,
        gridY: item.gridY,
        gridW: item.gridW,
        gridH: item.gridH,
      },
    })
  );

  const updatedModules = await prisma.$transaction(updatePromises);
  // ...
}
```

**问题分析**:
- 使用 `$transaction` 并行执行多个 UPDATE 语句
- 对于大量模块，可能导致性能问题

**建议**:
```typescript
// ✅ 使用 updateMany
export async function saveLayout(layoutItems: LayoutItem[]): Promise<ActionResult<PageModule[]>> {
  // ...

  // 使用单次更新语句（如果 Prisma 支持）
  // 或者分批更新
  const batchSize = 50;
  const batches = [];

  for (let i = 0; i < validated.length; i += batchSize) {
    const batch = validated.slice(i, i + batchSize);
    batches.push(
      prisma.$transaction(
        batch.map((item) =>
          prisma.pageModule.update({
            where: { id: item.id },
            data: { gridX: item.gridX, gridY: item.gridY, gridW: item.gridW, gridH: item.gridH },
          })
        )
      )
    );
  }

  await Promise.all(batches);
  // ...
}
```

#### 4. ✅ 良好的错误处理

```typescript
try {
  // ...
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
  }
  console.error("saveLayout error:", error);
  return { success: false, error: "Failed to save layout" };
}
```

**评价**: ✅ 正确实现

---

## link-actions.ts

### 文件信息
- **路径**: `src/actions/link-actions.ts`
- **行数**: 246 行
- **状态**: ✅ 良好

### 评价

#### 1. ✅ 一致的错误处理模式

所有 actions 都遵循相同的模式：
1. 验证输入
2. 检查认证
3. 执行操作
4. 返回结果

#### 2. ✅ 良好的所有权验证

```typescript
// Verify link exists and belongs to the user
const existingLink = await prisma.link.findUnique({
  where: { id },
  select: { userId: true },
});

if (!existingLink) {
  return { success: false, error: "Link not found" };
}

if (existingLink.userId !== session.user.id) {
  return { success: false, error: "Not authorized to update this link" };
}
```

**评价**: ✅ 正确的安全检查

---

## user-actions.ts

### 文件信息
- **路径**: `src/actions/user-actions.ts`
- **行数**: 340 行
- **状态**: ⚠️ 需要改进

### 问题分析

#### 1. ⚠️ 重复的用户 select 语句

**问题**: 每个 action 都有相同的 select 语句

```typescript
const user = await prisma.user.update({
  where: { id: session.user.id },
  data: { /* ... */ },
  select: {
    id: true,
    email: true,
    username: true,
    name: true,
    bio: true,
    avatarUrl: true,
    phone: true,
    contact: true,
    projects: true,
    theme: true,
    createdAt: true,
    updatedAt: true,
  },
});
```

**建议**:
```typescript
// ✅ 提取为常量
const USER_SELECT_FIELDS = {
  id: true,
  email: true,
  username: true,
  name: true,
  bio: true,
  avatarUrl: true,
  phone: true,
  contact: true,
  projects: true,
  theme: true,
  createdAt: true,
  updatedAt: true,
} as const;

// 使用
const user = await prisma.user.update({
  where: { id: session.user.id },
  data: { /* ... */ },
  select: USER_SELECT_FIELDS,
});
```

#### 2. ⚠️ 重复的类型转换

**问题** (第 94, 132, 189, 242, 287, 332 行):
```typescript
return { success: true, data: user as unknown as UserResult };
```

**建议**:
```typescript
// ✅ 创建辅助函数
function toUserResult(user: Prisma.UserSelect<typeof USER_SELECT_FIELDS>): UserResult {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    contact: user.contact,
    projects: user.projects as Project[] | null,
    theme: user.theme as ThemeType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// 使用
return { success: true, data: toUserResult(user) };
```

#### 3. ⚠️ 用户注册时缺少会话管理

**问题** (第 43-105 行):
```typescript
export async function registerUser(data: RegisterInput): Promise<ActionResult<UserResult>> {
  // ...
  const user = await prisma.user.create({ /* ... */ });
  return { success: true, data: user as unknown as UserResult };
}
```

**问题分析**:
- 注册成功后没有自动登录
- 用户需要手动登录

**建议**:
```typescript
// 注册后自动登录
import { signIn } from '@/lib/auth';

export async function registerUser(data: RegisterInput): Promise<ActionResult<UserResult>> {
  // ...
  const user = await prisma.user.create({ /* ... */ });

  // 自动登录
  await signIn('credentials', {
    email: user.email,
    // 注意：这里需要根据认证配置调整
  });

  return { success: true, data: toUserResult(user) };
}
```

---

## 总体建议

### 1. 统一的结果类型

**当前问题**: 每个文件都定义 `ActionResult` 类型

**建议**:
```typescript
// src/types/actions.ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// 使用
import type { ActionResult } from '@/types/actions';
```

### 2. 统一的认证检查

**建议**:
```typescript
// src/actions/utils/auth.ts
export async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthorizationError("Authentication required");
  }
  return session.user.id;
}

// src/actions/utils/errors.ts
export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// 使用
export async function createModule(data: CreateModuleInput) {
  try {
    const userId = await requireAuth();
    const validated = createModuleSchema.parse(data);
    // ...
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    // ...
  }
}
```

### 3. 使用 React.cache 去重

**建议**:
```typescript
import { cache } from 'react';

export const getModules = cache(async (): Promise<ActionResult<PageModule[]>> => {
  // React 自动在请求级别去重
  // 同一个请求中多次调用只会执行一次
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required" };
  }

  const modules = await prisma.pageModule.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
  });

  return { success: true, data: typedModules };
});
```

---

## 优先级修复列表

| 优先级 | 问题 | 文件 | 行数 |
|--------|------|------|------|
| 🟡 中 | 拆分 module-actions.ts | `module-actions.ts` | 全部 (487 行) |
| 🟡 中 | 提取重复的 select 语句 | `user-actions.ts` | 多处 |
| 🟡 中 | 创建辅助函数减少类型转换 | `user-actions.ts` | 多处 |
| 🟢 低 | 添加 React.cache 去重 | 多个 actions | - |
| 🟢 低 | 统一 ActionResult 类型 | 所有 actions | - |

---

## 相关 Vercel React Best Practices

1. **server-cache-react**: 可以使用 React.cache() 去重请求
2. **server-parallel-fetching**: 可以并行化多个查询
3. **server-dedup-props**: 避免重复序列化

---

**审查人员**: Claude AI
**最后更新**: 2026-01-29
