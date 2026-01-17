# Server Actions 问题报告

**审查日期**: 2026-01-17
**审查范围**: 所有 Server Actions 文件

---

## 问题列表

### 1. 重复的 ActionResult 类型定义

**文件**: `src/actions/user-actions.ts`, `src/actions/upload-actions.ts`
**行号**: `user-actions.ts:36-38`, `upload-actions.ts:9-11`

**问题描述**:
`ActionResult` 类型在多个文件中重复定义，而不是从 `@/types` 导入。

**当前代码**:
```typescript
// src/actions/user-actions.ts 第36行
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// src/actions/upload-actions.ts 第9行
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// src/types/index.ts 第75行已定义
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

**问题分析**:
- 代码重复，违反 DRY 原则
- 如果需要修改 ActionResult 类型，需要在多处修改
- 类型不一致的风险

**修改建议**:
从 `@/types` 导入 ActionResult 类型

**修改思路**:
```typescript
// 删除重复定义，改为
import type { ActionResult } from "@/types";
```

**受影响文件**:
- `src/actions/user-actions.ts`
- `src/actions/upload-actions.ts`

---

### 2. publish-actions.ts 中使用原生 SQL 而非 Prisma API

**文件**: `src/actions/publish-actions.ts`
**行号**: 38-42, 73-77, 109-117

**问题描述**:
使用 `$executeRaw` 和 `$queryRaw` 执行原生 SQL，绕过了 Prisma 的类型安全。

**当前代码**:
```typescript
// 第38行
await prisma.$executeRaw`
  UPDATE "User"
  SET "isPublished" = true, "publishedAt" = ${new Date()}, "updatedAt" = ${new Date()}
  WHERE id = ${userId}
`;
```

**问题分析**:
- 代码注释说"to avoid type issues"，但没有说明是什么类型问题
- 原生 SQL 失去了 Prisma 的类型检查和迁移支持
- SQL 注入风险（虽然使用了参数化查询）
- 代码可读性降低

**修改建议**:
使用 Prisma 的 `update` 方法代替原生 SQL

**修改思路**:
```typescript
// 替换 $executeRaw 为标准的 Prisma update
const user = await prisma.user.update({
  where: { id: userId },
  data: {
    isPublished: true,
    publishedAt: new Date(),
  },
});
```

**注意**: 如果确实存在类型问题（如 `isPublished` 字段类型问题），应该在 Prisma schema 中解决，而不是绕过类型系统。

---

### 3. 错误消息语言不一致

**文件**: 多个 actions 文件
**行号**: 多处

**问题描述**:
同一个文件中同时存在中文和英文错误消息。

**当前代码**:
```typescript
// src/actions/user-actions.ts
return { success: false, error: "需要认证" };  // 中文
return { success: false, error: "Authentication required" };  // 英文
return { success: false, error: "Failed to update profile" };  // 英文
return { success: false, error: "用户不存在" };  // 中文
```

**问题分析**:
- 用户体验不一致
- 代码可维护性差
- 国际化支持困难

**修改建议**:
统一使用一种语言，或创建一个错误消息常量文件

**修改思路**:
```typescript
// src/lib/error-messages.ts
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "需要认证",
  USER_NOT_FOUND: "用户不存在",
  // ...
} as const;

// 或使用英文统一
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "Authentication required",
  USER_NOT_FOUND: "User not found",
  // ...
} as const;
```

---

### 4. getUserByEmail 函数未导出

**文件**: `src/actions/user-actions.ts`
**行号**: 107-134

**问题描述**:
`getUserByEmail` 函数被定义但未导出，无法在其他地方使用。

**问题分析**:
- 函数已实现完整功能，但因为没有 `export` 而无法使用
- 可能是遗漏，或者是死代码

**修改建议**:
如果需要使用此函数，添加 `export` 关键字；如果不需要，删除此函数

**修改思路**:
```typescript
// 如果需要此功能
export async function getUserByEmail(
  email: string
): Promise<ActionResult<UserResult | null>> {
  // ...
}

// 或者删除死代码
```

---

### 5. 缺少输入数据清理

**文件**: `src/actions/upload-actions.ts`
**行号**: 57-60

**问题描述**:
生成文件名时使用 `Math.random().substring(7)`，这不是安全的随机字符串生成方式。

**当前代码**:
```typescript
const timestamp = Date.now();
const random = Math.random().toString(36).substring(7);
const filename = `${session.user.id}-${timestamp}-${random}.${extension}`;
```

**问题分析**:
- `Math.random()` 不是密码学安全的随机数生成器
- 在高并发场景下可能产生相同的文件名
- `toString(36).substring(7)` 只能产生约 28 亿种组合，不够安全

**修改建议**:
使用 Node.js 的 `crypto` 模块生成安全的随机字符串

**修改思路**:
```typescript
import { randomBytes } from "crypto";

const timestamp = Date.now();
const random = randomBytes(8).toString("hex"); // 16字符的安全随机字符串
const filename = `${session.user.id}-${timestamp}-${random}.${extension}`;
```

---

### 6. upload-actions.ts 中 catch 块错误处理不够具体

**文件**: `src/actions/upload-actions.ts`
**行号**: 79-82

**问题描述**:
所有错误都返回通用的"上传失败"消息，没有区分错误类型。

**当前代码**:
```typescript
} catch (error) {
    console.error("uploadAvatar error:", error);
    return { success: false, error: "上传失败" };
}
```

**问题分析**:
- 用户无法知道具体是文件太大、格式不支持还是服务器错误
- 调试困难

**修改建议**:
根据错误类型返回不同的错误消息

**修改思路**:
```typescript
} catch (error) {
    console.error("uploadAvatar error:", error);

    if (error instanceof Error) {
        if (error.message.includes("ENOENT")) {
            return { success: false, error: "文件系统错误，无法保存文件" };
        }
        if (error.message.includes("EACCES")) {
            return { success: false, error: "权限不足，无法保存文件" };
        }
    }

    return { success: false, error: "上传失败，请稍后重试" };
}
```

---

## 严重程度评级

| 问题 | 严重程度 | 影响范围 |
|-----|---------|---------|
| 重复 ActionResult 定义 | 低 | 代码质量 |
| 使用原生 SQL | 中 | 类型安全、可维护性 |
| 错误消息不一致 | 低 | 用户体验 |
| 未导出函数 | 低 | 代码完整性 |
| 不安全的随机数 | 中 | 安全性 |
| 通用错误处理 | 低 | 用户体验 |

---

## 建议修复优先级

1. **高优先级**: 问题 #5 (不安全的随机数) - 安全隐患
2. **中优先级**: 问题 #2 (使用原生 SQL) - 类型安全
3. **中优先级**: 问题 #6 (错误处理) - 用户体验
4. **低优先级**: 问题 #1、#3、#4 - 代码质量

---

## 相关文件清单

- `src/actions/user-actions.ts`
- `src/actions/upload-actions.ts`
- `src/actions/publish-actions.ts`
- `src/actions/link-actions.ts`
- `src/actions/module-actions.ts`
- `src/types/index.ts`
