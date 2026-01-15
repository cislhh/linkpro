# 个人资料页面重构 - 完整开发文档

## 概述

本文档记录了个人资料页面从简单展示页重构为可编辑表单的完整开发过程，包括数据库设计、接口开发、前端实现以及遇到的问题和解决方案。

**开发日期**: 2026-01-15
**开发者**: Claude AI
**项目**: LinkPro

---

## 目录

1. [需求分析](#需求分析)
2. [数据库设计](#数据库设计)
3. [类型定义](#类型定义)
4. [后端接口开发](#后端接口开发)
5. [前端组件开发](#前端组件开发)
6. [问题与解决方案](#问题与解决方案)
7. [技术要点总结](#技术要点总结)

---

## 需求分析

### 核心需求

1. **个人资料编辑功能**
   - 支持编辑：姓名、电话、联系方式、头像、简介
   - 头像上传：本地图片上传，而非URL输入

2. **数据同步**
   - 个人资料数据同步到 BioModule（关于我卡片）
   - BioModule 优先从 User 表读取数据

3. **移除冗余编辑**
   - 取消模块编辑对话框中 Bio 模块的独立编辑功能

4. **用户体验要求**
   - 保存后表单数据不清空
   - 刷新页面自动加载数据
   - 减少接口调用，优化性能

---

## 数据库设计

### User 表扩展

**文件**: `prisma/schema.prisma`

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  username      String    @unique
  name          String?
  bio           String?
  avatarUrl     String?
  phone         String?   // 新增：电话号码
  contact       String?   // 新增：联系方式（微信、邮箱等）
  password      String
  theme         String    @default("aurora")
  // ... 其他字段
}
```

### 数据库迁移

**执行命令**:
```bash
npx prisma migrate dev --name add_phone_and_contact_fields
```

**生成SQL**:
```sql
ALTER TABLE "User" ADD COLUMN "contact" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
```

**迁移文件**: `prisma/migrations/20260115041318_add_phone_and_contact_fields/migration.sql`

---

## 类型定义

### 1. Prisma 类型问题解决

#### 问题
Prisma 生成的 `User` 类型与自定义的 `UserResult` 类型不匹配，导致 TypeScript 编译错误。

#### 解决方案
在 `src/actions/user-actions.ts` 中定义专门的返回类型：

```typescript
// User type for return values - matches select statements in actions
type UserResult = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  contact: string | null;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
};
```

**关键点**：
- 不要使用 Prisma 生成的完整 `User` 类型作为返回值
- 自定义类型只包含实际 select 的字段
- 确保所有 Server Actions 返回类型一致

### 2. NextAuth 类型扩展

**文件**: `src/types/next-auth.d.ts`

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      phone?: string | null;
      contact?: string | null;
      bio?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    phone?: string | null;
    contact?: string | null;
    bio?: string | null;
  }
}
```

### 3. 应用级类型定义

**文件**: `src/types/index.ts`

```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  contact: string | null;
  theme: ThemeType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeProps {
  links: Link[];
  user: Pick<User, 'name' | 'bio' | 'avatarUrl' | 'username' | 'phone' | 'contact'>;
  className?: string;
}
```

---

## 后端接口开发

### 接口设计原则

1. **单一职责**：每个接口只做一件事
2. **类型安全**：使用 Zod 进行运行时验证
3. **错误处理**：统一的返回格式
4. **避免 `any` 类型**：严格的类型定义

### 接口返回类型定义

**文件**: `src/actions/user-actions.ts`

```typescript
// 统一的返回类型
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### 接口 1: 获取用户信息

**文件**: `src/actions/user-actions.ts`

```typescript
/**
 * Get current user profile
 * Returns the authenticated user's profile data including phone and contact
 */
export async function getUserProfile(): Promise<ActionResult<UserResult>> {
  try {
    // 1. 验证身份
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "需要认证" };
    }

    // 2. 查询数据库 - 只选择需要的字段
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        phone: true,
        contact: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 3. 验证用户存在
    if (!user) {
      return { success: false, error: "用户不存在" };
    }

    // 4. 返回数据
    return { success: true, data: user };
  } catch (error) {
    console.error("getUserProfile error:", error);
    return { success: false, error: "获取用户信息失败" };
  }
}
```

**开发要点**：
- ✅ 使用 `auth()` 验证用户身份
- ✅ `select` 明确指定返回字段，避免暴露敏感数据
- ✅ 统一的错误处理和日志记录
- ✅ 类型安全的返回值

### 接口 2: 更新用户信息

```typescript
/**
 * Update user profile (name, bio, avatarUrl, phone, contact)
 */
export async function updateUserProfile(
  data: UpdateProfileInput
): Promise<ActionResult<UserResult>> {
  try {
    // 1. 验证身份
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // 2. 验证输入数据
    const validated = updateProfileSchema.parse(data);

    // 3. 更新数据库
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
        bio: validated.bio,
        avatarUrl: validated.avatarUrl === "" ? null : validated.avatarUrl,
        phone: validated.phone && validated.phone !== "" ? validated.phone : null,
        contact: validated.contact && validated.contact !== "" ? validated.contact : null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        phone: true,
        contact: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    console.error("updateUserProfile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
```

**开发要点**：
- ✅ 空字符串转换为 `null`
- ✅ Zod 验证在 try-catch 中处理
- ✅ 返回完整的更新后数据，用于前端更新 UI

### 接口 3: 上传头像

**文件**: `src/actions/upload-actions.ts`

```typescript
/**
 * Upload avatar image
 *
 * Specifications:
 * - Max file size: 2MB
 * - Allowed formats: JPG, PNG, WebP
 * - Recommended size: 400x400px
 * - Minimum size: 200x200px
 *
 * The file is saved to public/avatars directory with a unique filename.
 */
export async function uploadAvatar(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    // 1. 验证身份
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "需要认证" };
    }

    // 2. 获取文件
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "未找到文件" };
    }

    // 3. 验证文件大小
    if (file.size > AVATAR_SPEC.maxSize) {
      return {
        success: false,
        error: `文件大小不能超过 ${AVATAR_SPEC.maxSize / 1024 / 1024}MB`,
      };
    }

    // 4. 验证文件类型
    const isValidType = AVATAR_SPEC.allowedFormats.some(format => format === file.type);
    if (!isValidType) {
      return {
        success: false,
        error: "不支持的文件格式。支持的格式: JPG, PNG, WebP",
      };
    }

    // 5. 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = getFileExtension(file.type);
    const filename = `${session.user.id}-${timestamp}-${random}.${extension}`;

    // 6. 创建目录（如不存在）
    const avatarsDir = join(process.cwd(), "public", "avatars");
    try {
      await mkdir(avatarsDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore error
    }

    // 7. 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(avatarsDir, filename);
    await writeFile(filepath, buffer);

    // 8. 返回公共 URL
    const url = `/avatars/${filename}`;
    return { success: true, data: { url } };
  } catch (error) {
    console.error("uploadAvatar error:", error);
    return { success: false, error: "上传失败" };
  }
}

// 辅助函数：获取文件扩展名
function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return extensions[mimeType] || "jpg";
}
```

**开发要点**：
- ✅ 文件名包含用户ID，防止冲突
- ✅ 使用时间戳和随机字符串确保唯一性
- ✅ `mkdir` 使用 `recursive: true` 自动创建目录
- ✅ 返回相对路径，方便前端使用

**文件上传规格定义**（`src/lib/constants.ts`）：

```typescript
export const AVATAR_SPEC = {
  maxSize: 2 * 1024 * 1024,        // 2MB in bytes
  allowedFormats: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  recommendedSize: { width: 400, height: 400 },
  minSize: { width: 200, height: 200 },
} as const;
```

### 数据验证 Schema

**文件**: `src/lib/validations.ts`

```typescript
// 用户资料更新验证
export const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal('')),
  phone: z.string().regex(/^[+]?[\d\s\-()]*$/, 'Invalid phone number').max(50).optional().or(z.literal('')),
  contact: z.string().max(200).optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

**验证要点**：
- ✅ `avatarUrl` 使用 `max(500)` 而非 `url()`，支持相对路径
- ✅ `phone` 使用正则验证国际号码格式
- ✅ 空字符串通过 `.or(z.literal(''))` 处理

---

## 前端组件开发

### 组件架构

```
src/components/features/profile/
├── profile-form.tsx      # 主表单组件
└── index.ts             # 导出文件
```

### ProfileForm 组件完整实现

**文件**: `src/components/features/profile/profile-form.tsx`

```typescript
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, User, Phone, Mail, CheckCircle2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { updateUserProfile, getUserProfile } from "@/actions/user-actions";
import { uploadAvatar } from "@/actions/upload-actions";
import { AVATAR_SPEC } from "@/lib/constants";
import { updateProfileSchema } from "@/lib/validations";
import type { UpdateProfileInput } from "@/lib/validations";

// 表单验证 Schema
const profileFormSchema = updateProfileSchema.extend({
  phone: z.string().regex(/^[+]?[\d\s\-()]*$/, "电话号码格式无效").max(50, "电话号码过长").optional().or(z.literal("")),
  contact: z.string().max(200, "联系方式过长").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ onSuccess }: ProfileFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatarUrl: "",
      phone: "",
      contact: "",
    },
    mode: "onBlur",
  });

  // 📌 关键点1: 组件挂载时加载数据
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        const result = await getUserProfile();

        if (isMounted && result.success) {
          const data = result.data;
          form.reset({
            name: data.name || "",
            bio: data.bio || "",
            avatarUrl: data.avatarUrl || "",
            phone: data.phone || "",
            contact: data.contact || "",
          });
          setAvatarPreview(data.avatarUrl);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // 📌 关键点2: 头像上传后自动保存
  const handleAvatarUpload = async (file: File) => {
    // 验证文件大小
    if (file.size > AVATAR_SPEC.maxSize) {
      toast.error("文件过大", {
        description: `最大文件大小为 ${AVATAR_SPEC.maxSize / 1024 / 1024}MB`,
      });
      return;
    }

    // 验证文件类型
    const isValidType = AVATAR_SPEC.allowedFormats.some(format => format === file.type);
    if (!isValidType) {
      toast.error("不支持的文件格式", {
        description: "支持的格式: JPG, PNG, WebP",
      });
      return;
    }

    setIsUploading(true);

    try {
      // 步骤1: 上传文件
      const formData = new FormData();
      formData.append("file", file);
      const uploadResult = await uploadAvatar(formData);

      if (!uploadResult.success) {
        toast.error("上传失败", { description: uploadResult.error });
        return;
      }

      // 步骤2: 自动保存到数据库
      const currentValues = form.getValues();
      const updateResult = await updateUserProfile({
        ...currentValues,
        avatarUrl: uploadResult.data.url,
      } as UpdateProfileInput);

      if (updateResult.success) {
        // 步骤3: 更新UI
        form.reset({
          name: updateResult.data.name || "",
          bio: updateResult.data.bio || "",
          avatarUrl: updateResult.data.avatarUrl || "",
          phone: updateResult.data.phone || "",
          contact: updateResult.data.contact || "",
        });
        setAvatarPreview(updateResult.data.avatarUrl);
        toast.success("头像上传成功");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("上传失败", { description: "请稍后重试" });
    } finally {
      setIsUploading(false);
    }
  };

  // 📌 关键点3: 表单提交保留数据
  const onSubmit = async (data: ProfileFormValues) => {
    setIsPending(true);

    try {
      const result = await updateUserProfile(data as UpdateProfileInput);

      if (result.success) {
        // 使用服务器返回的数据更新表单（不清空）
        form.reset({
          name: result.data.name || "",
          bio: result.data.bio || "",
          avatarUrl: result.data.avatarUrl || "",
          phone: result.data.phone || "",
          contact: result.data.contact || "",
        });

        if (result.data.avatarUrl) {
          setAvatarPreview(result.data.avatarUrl);
        }

        toast.success("个人资料已更新", {
          description: "您的信息已成功保存",
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });

        onSuccess?.();
      } else {
        toast.error("更新失败", { description: result.error });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("更新失败", { description: "请稍后重试" });
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // ... JSX 渲染部分
}
```

### 关键开发要点

#### 1. 数据加载模式

```typescript
useEffect(() => {
  let isMounted = true;

  async function loadProfile() {
    const result = await getUserProfile();
    if (isMounted && result.success) {
      form.reset(result.data);
    }
  }

  loadProfile();

  return () => { isMounted = false; };
}, []);
```

**要点**：
- ✅ 使用 `isMounted` 标志防止组件卸载后更新状态
- ✅ cleanup 函数中设置 `isMounted = false`
- ✅ 使用 `form.reset()` 而非 `setValue()` 来更新多个字段

#### 2. 头像上传流程

```typescript
// 上传 → 保存 → 更新UI（三步流程）
const uploadResult = await uploadAvatar(formData);
const updateResult = await updateUserProfile({ avatarUrl: uploadResult.data.url });
form.reset(updateResult.data);
```

**要点**：
- ✅ 上传成功后立即保存到数据库
- ✅ 使用服务器返回的数据更新UI，确保一致性
- ✅ 避免用户需要再点击"保存"按钮

#### 3. 表单提交后保留数据

```typescript
if (result.success) {
  form.reset(result.data);  // 使用服务器数据重置表单
  // 不清空，保留所有值
}
```

**要点**：
- ✅ 使用服务器返回的数据而非客户端输入
- ✅ `form.reset()` 会更新所有字段并清除 `isDirty` 状态
- ✅ 用户可以继续编辑，不会丢失数据

---

## 问题与解决方案

### 问题 1: TypeScript 类型错误 - phone/contact 字段缺失

**错误信息**:
```
Type '{ ... }' is missing the following properties from type 'UserResult': phone, contact
```

**原因分析**:
1. Prisma 客户端未正确生成包含新字段的类型
2. TypeScript 使用了缓存的类型定义

**解决方案**:
```bash
# 1. 删除 Prisma 缓存
rm -rf node_modules/.prisma

# 2. 重新生成客户端
npx prisma generate

# 3. 清理 Next.js 缓存
rm -rf .next
```

**经验总结**:
- 每次修改 schema 后必须运行 `npx prisma generate`
- 如果类型问题持续，删除 `.prisma` 文件夹
- TypeScript IDE 可能需要重启才能识别新类型

### 问题 2: Server Action 导出错误

**错误信息**:
```
A "use server" file can only export async functions, found object.
```

**原因分析**:
`src/actions/upload-actions.ts` 导出了 `avatarUploadSchema` 对象和 `AVATAR_SPEC` 常量，违反了 Next.js 的 Server Action 规则。

**错误代码**:
```typescript
"use server";

export const AVATAR_SPEC = { ... };           // ❌ 不能导出对象
export const avatarUploadSchema = z.object({ ... }); // ❌ 不能导出 Schema
```

**解决方案**:
1. 将常量移到 `src/lib/constants.ts`:
```typescript
// src/lib/constants.ts
export const AVATAR_SPEC = {
  maxSize: 2 * 1024 * 1024,
  allowedFormats: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  recommendedSize: { width: 400, height: 400 },
  minSize: { width: 200, height: 200 },
} as const;
```

2. Server Action 文件只导出函数:
```typescript
// src/actions/upload-actions.ts
"use server";
import { AVATAR_SPEC } from "@/lib/constants";

export async function uploadAvatar(...) { ... }
```

**经验总结**:
- Server Action 文件中只能导出异步函数
- 将常量和类型定义移到 `lib/` 目录
- 使用 `import` 而非 `export` 来共享常量

### 问题 3: 头像上传失败 - Invalid URL

**错误信息**:
```
Invalid URL
```

**原因分析**:
`updateProfileSchema` 中 `avatarUrl` 使用了 `z.string().url()` 验证，但上传后返回的是相对路径 `/avatars/xxx.jpg`，不是完整 URL。

**错误代码**:
```typescript
avatarUrl: z.string().url().optional().or(z.literal(''))
```

**解决方案**:
```typescript
avatarUrl: z.string().max(500).optional().or(z.literal(''))
```

**经验总结**:
- 相对路径（如 `/avatars/xxx.jpg`）不通过 `url()` 验证
- 使用 `max()` 限制长度同时允许相对路径和完整URL
- 在客户端或服务器端进行额外的URL格式验证（如需要）

### 问题 4: 保存后表单清空

**问题描述**:
用户填写信息后点击保存，表单字段变为空。

**原因分析**:
1. 调用了 `session.update()` 更新 NextAuth session
2. Session 更新触发 `useEffect` 重新执行
3. Session 中的数据不完整（缺少 phone/contact）

**错误代码**:
```typescript
const onSubmit = async (data) => {
  const result = await updateUserProfile(data);

  // ❌ 这会导致额外的 session 请求
  await update({
    ...session?.user,
    name: result.data.name,
    image: result.data.avatarUrl,
  });
};
```

**解决方案**:
```typescript
const onSubmit = async (data) => {
  const result = await updateUserProfile(data);

  if (result.success) {
    // ✅ 使用服务器返回的数据直接更新表单
    form.reset({
      name: result.data.name || "",
      bio: result.data.bio || "",
      avatarUrl: result.data.avatarUrl || "",
      phone: result.data.phone || "",
      contact: result.data.contact || "",
    });
  }
};
```

**经验总结**:
- 避免在表单提交后调用 `session.update()`
- 使用 Server Action 返回的数据更新 UI
- 减少不必要的网络请求（从3个降到1个）

### 问题 5: 刷新页面数据不反显

**问题描述**:
用户刷新页面或重新进入，表单字段为空。

**原因分析**:
1. 依赖 NextAuth session 获取数据
2. Session 中没有包含 phone 和 contact 字段
3. Session 数据不是最新的数据库数据

**解决方案**:
添加 `getUserProfile` API，在组件挂载时调用：

```typescript
useEffect(() => {
  async function loadProfile() {
    const result = await getUserProfile();
    if (result.success) {
      form.reset(result.data);
    }
  }
  loadProfile();
}, []);
```

**经验总结**:
- 不要依赖 session 作为数据源
- 创建专门的 API 获取最新数据
- 在组件挂载时主动获取数据

### 问题 6: `any` 类型使用

**问题位置**:
- `src/actions/user-actions.ts`: `(validated as any).phone`
- `src/components/features/profile/profile-form.tsx`: `(session?.user as any)?.phone`

**原因**:
- `updateProfileSchema` 定义时缺少 phone/contact 字段
- Session 类型定义不完整

**解决方案**:
1. 更新 `updateProfileSchema`:
```typescript
export const updateProfileSchema = z.object({
  phone: z.string().regex(/^[+]?[\d\s\-()]*$/, 'Invalid phone number').max(50).optional().or(z.literal('')),
  contact: z.string().max(200).optional().or(z.literal('')),
});
```

2. 正确使用验证后的数据:
```typescript
// ✅ 正确 - validated 包含 phone 和 contact
const validated = updateProfileSchema.parse(data);
phone: validated.phone && validated.phone !== "" ? validated.phone : null

// ❌ 错误 - 使用 any
phone: (validated as any).phone
```

**经验总结**:
- 遵守 CLAUDE.md 规则：禁止使用 `any` 类型
- 正确扩展 Zod schema 以包含所有字段
- 验证后的数据类型是完整的，不需要类型断言

---

## 技术要点总结

### 1. Next.js Server Actions 最佳实践

#### ✅ DO（推荐做法）

```typescript
// 1. 统一的返回类型
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// 2. 完整的错误处理
export async function myAction(data: Input) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "需要认证" };
    }

    const validated = schema.parse(data);
    // ... 处理逻辑

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "验证失败" };
    }
    console.error("Action error:", error);
    return { success: false, error: "操作失败" };
  }
}

// 3. 只导出异步函数
"use server";
export async function doSomething() { ... }
```

#### ❌ DON'T（避免做法）

```typescript
// 1. 不要导出对象或常量
"use server";
export const CONSTANT = { ... };  // ❌

// 2. 不要使用 any
const result = data as any;  // ❌

// 3. 不要跳过身份验证
export async function myAction() {
  // ❌ 没有 auth() 检查
  return await prisma.user.findMany();
}

// 4. 不要返回 Prisma 完整对象
return await prisma.user.findMany();  // ❌ 包含敏感字段
```

### 2. React Hook Form + Zod 模式

```typescript
// 1. 定义 Schema
const formSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

// 2. 创建表单
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: "",
    email: "",
  },
});

// 3. 更新表单（多字段）
form.reset({
  name: data.name,
  email: data.email,
  // ✅ 使用 reset 而非多次 setValue
});

// 4. 提交处理
const onSubmit = async (values) => {
  const result = await myAction(values);
  if (result.success) {
    form.reset(result.data);  // 用服务器数据更新
  }
};
```

### 3. 文件上传模式

```typescript
// 客户端
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const result = await uploadFile(formData);
  if (result.success) {
    // 保存 URL 到数据库
    await saveUrl(result.data.url);
  }
};

// 服务端
export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;

  // 验证
  if (file.size > MAX_SIZE) { ... }

  // 生成唯一文件名
  const filename = `${userId}-${Date.now()}-${random()}.${ext}`;

  // 保存到 public 目录
  await writeFile(join(process.cwd(), "public", "uploads", filename), buffer);

  return { success: true, data: { url: `/uploads/${filename}` } };
}
```

### 4. 类型安全的数据流

```
数据库 (Prisma)
    ↓ (select 指定字段)
Server Action (UserResult)
    ↓ (ActionResult<UserResult>)
客户端 (TypeScript)
    ↓ (form.reset)
UI 表单
```

**关键点**：
- 每一层都有明确的类型定义
- 使用 `select` 控制返回字段
- 避免 Prisma 类型的"泄漏"

---

## 文件清单

### 新建文件

| 文件路径 | 说明 |
|---------|------|
| `src/lib/constants.ts` | 应用常量（AVATAR_SPEC） |
| `src/actions/upload-actions.ts` | 头像上传 Server Action |
| `src/components/features/profile/profile-form.tsx` | 个人资料表单组件 |
| `src/components/features/profile/index.ts` | 导出文件 |

### 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `prisma/schema.prisma` | 添加 phone、contact 字段 |
| `src/types/index.ts` | 更新 User、ThemeProps 接口 |
| `src/types/next-auth.d.ts` | 扩展 Session、JWT 接口 |
| `src/lib/validations.ts` | 更新 updateProfileSchema |
| `src/actions/user-actions.ts` | 添加 getUserProfile，修复类型 |
| `src/lib/auth.ts` | 更新 session callback |
| `src/components/features/modules/bio-module.tsx` | 支持 User 数据源 |
| `src/components/features/layout-editor/module-card.tsx` | 传递 userData |
| `src/components/features/preview/layout-preview.tsx` | 传递 phone、contact |
| `src/components/themes/base-theme.tsx` | 显示 phone、contact |
| `src/app/(dashboard)/dashboard/themes/page.tsx` | 更新 sampleUser |
| `src/app/u/[username]/page.tsx` | 更新 UserData 接口和查询 |

---

## 部署检查清单

- [ ] 数据库迁移已执行
- [ ] Prisma 客户端已重新生成
- [ ] TypeScript 编译无错误
- [ ] 所有 Server Actions 只导出异步函数
- [ ] 文件上传目录 `public/avatars` 存在或可自动创建
- [ ] 表单验证正确处理空字符串
- [ ] Session 包含新增字段（phone、contact）
- [ ] 测试头像上传完整流程
- [ ] 测试表单保存后数据保留
- [ ] 测试页面刷新数据反显

---

## 参考资料

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [NextAuth.js v5](https://authjs.dev/)

---

**文档版本**: 1.0.0
**最后更新**: 2026-01-15
**维护者**: LinkPro 开发团队
