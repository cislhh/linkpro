# 个人简介模块字段可见性控制 - 完整开发文档

## 概述

本文档记录了为个人简介模块添加字段可见性控制功能的完整开发过程。该功能允许用户在页面管理中配置个人简介模块显示哪些字段，实现数据源统一（来自个人信息）与显示灵活性控制。

**开发日期**: 2026-01-16
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

## 需求分析

### 核心需求

1. **数据源统一**
   - 个人简介模块的数据来源于个人信息-个人资料模块
   - 不再允许在模块中独立编辑数据

2. **字段可见性控制**
   - 在页面管理的"我的模块"中，个人简介模块的修改按钮
   - 打开配置对话框，通过复选框控制各字段的显示/隐藏
   - 可控字段：姓名、个人简介、头像、电话、联系方式

3. **数据安全**
   - 取消显示不影响数据本身
   - 数据仍保存在个人信息中

### 用户流程

```
个人信息页面 (填写数据)
        ↓
    数据存储到 User 表
        ↓
页面管理 → 我的模块 → 个人简介 → 修改按钮
        ↓
    打开显示配置对话框
        ↓
    勾选要显示的字段 → 保存
        ↓
    BioModule 根据 visibleFields 渲染
```

---

## 技术设计

### 数据结构设计

#### BioModuleData 扩展

**文件**: `src/types/index.ts`

```typescript
// Bio module data - personal introduction
export interface BioModuleData {
  type: 'bio';
  name: string;
  bio: string;
  avatar: string | null;
  // 新增：字段可见性配置
  visibleFields?: BioVisibleFields;
}

// 新增：Bio 模块字段可见性配置
export interface BioVisibleFields {
  name: boolean;        // 显示/隐藏姓名
  bio: boolean;         // 显示/隐藏个人简介
  avatar: boolean;      // 显示/隐藏头像
  phone: boolean;       // 显示/隐藏电话
  contact: boolean;     // 显示/隐藏联系方式
}
```

**设计要点**：
- `visibleFields` 为可选字段，保持向后兼容
- 默认值为 `true`（显示），未配置时全部显示
- 使用布尔值控制每个字段的可见性

### 验证 Schema 更新

**文件**: `src/lib/validations.ts`

```typescript
// Bio module data schema
export const bioModuleDataSchema = z.object({
  type: z.literal('bio'),
  name: z.string().max(100, 'Name too long'),
  bio: z.string().max(500, 'Bio too long'),
  avatar: z.string().url('Invalid avatar URL').nullable().optional(),
  // 新增：字段可见性配置
  visibleFields: z.object({
    name: z.boolean().default(true),
    bio: z.boolean().default(true),
    avatar: z.boolean().default(true),
    phone: z.boolean().default(true),
    contact: z.boolean().default(true),
  }).optional(),
});
```

### 组件架构

```
ModuleList (模块列表)
    ↓ 点击编辑按钮
ModuleEditDialog (通用编辑对话框)
    ↓ 检测到 bio 类型
    ├─ 前往个人信息页面按钮
    └─ 配置显示设置按钮
        ↓
    BioModuleConfigDialog (新增)
        ↓ 保存配置
    BioModule (渲染组件 - 已更新)
        ↓ 根据 visibleFields 渲染
    用户页面
```

---

## 实现细节

### 1. 更新 BioModule 组件支持可见性控制

**文件**: `src/components/features/modules/bio-module.tsx`

```typescript
"use client";

import { User, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BioModuleData, PageModule, BioVisibleFields } from "@/types";
import { cn } from "@/lib/utils";

// 默认可见性配置 - 全部字段可见
const DEFAULT_VISIBLE_FIELDS: BioVisibleFields = {
  name: true,
  bio: true,
  avatar: true,
  phone: true,
  contact: true,
};

export function BioModule({ module, userData, className }: BioModuleProps) {
  const moduleData = module.data as BioModuleData;

  // 获取可见性配置，回退到默认值
  const visibleFields: BioVisibleFields = {
    ...DEFAULT_VISIBLE_FIELDS,
    ...moduleData?.visibleFields,
  };

  // 使用用户数据（优先）或模块数据（向后兼容）
  const name = userData?.name || moduleData?.name || "";
  const bio = userData?.bio || moduleData?.bio || "";
  const avatar = userData?.avatarUrl || moduleData?.avatar || null;
  const phone = userData?.phone || null;
  const contact = userData?.contact || null;

  // 检查内容是否可见
  const hasContent = visibleFields.name && name;
  const hasContactInfo = (visibleFields.phone && phone) || (visibleFields.contact && contact);
  const hasBio = visibleFields.bio && bio;

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className={cn("flex flex-col items-center text-center")}>
        {/* 头像 - 根据 visibleFields.avatar 控制 */}
        {visibleFields.avatar && (
          <div className="mb-4">
            {avatar ? <img src={avatar} alt={name} /> : <User />}
          </div>
        )}

        {/* 姓名 - 根据 visibleFields.name 控制 */}
        {hasContent && <h2>{name}</h2>}

        {/* 联系方式 - 根据配置控制 */}
        {hasContactInfo && (
          <div className="flex flex-col gap-2">
            {visibleFields.phone && phone && <Phone />}
            {visibleFields.contact && contact && <Mail />}
          </div>
        )}

        {/* 个人简介 - 根据 visibleFields.bio 控制 */}
        {hasBio && <p>{bio}</p>}
      </CardContent>
    </Card>
  );
}
```

**关键实现**：
1. 定义 `DEFAULT_VISIBLE_FIELDS` 常量
2. 使用展开运算符合并默认值和用户配置
3. 每个 UI 块前先检查 `visibleFields` 对应字段
4. 保持对 `userData` 的支持（数据源统一）

### 2. 创建 BioModuleConfigDialog 组件

**文件**: `src/components/features/modules/bio-module-config-dialog.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { updateModule } from "@/actions/module-actions";
import type { PageModule, BioVisibleFields, BioModuleData } from "@/types";

// 字段定义列表
const FIELD_DEFINITIONS = [
    { key: "name" as keyof BioVisibleFields, label: "姓名", description: "显示您的姓名", icon: "👤" },
    { key: "bio" as keyof BioVisibleFields, label: "个人简介", description: "显示您的个人介绍", icon: "📝" },
    { key: "avatar" as keyof BioVisibleFields, label: "头像", description: "显示您的个人头像", icon: "🖼️" },
    { key: "phone" as keyof BioVisibleFields, label: "电话", description: "显示您的电话号码", icon: "📞" },
    { key: "contact" as keyof BioVisibleFields, label: "联系方式", description: "显示您的其他联系方式", icon: "✉️" },
];

export function BioModuleConfigDialog({
    module,
    open,
    onOpenChange,
    onSuccess,
}: BioModuleConfigDialogProps) {
    const [isPending, setIsPending] = useState(false);
    const [visibleFields, setVisibleFields] = useState<BioVisibleFields>(DEFAULT_VISIBLE_FIELDS);

    // 对话框打开时重置表单
    useEffect(() => {
        if (!module) return;
        const moduleData = module.data as BioModuleData;
        setVisibleFields({
            ...DEFAULT_VISIBLE_FIELDS,
            ...moduleData?.visibleFields,
        });
    }, [module?.id, module?.updatedAt]);

    const handleSubmit = async () => {
        if (!module) return;

        setIsPending(true);
        try {
            const moduleData = module.data as BioModuleData;
            const updatedData: BioModuleData = {
                type: "bio",
                name: moduleData?.name || "",
                bio: moduleData?.bio || "",
                avatar: moduleData?.avatar || null,
                visibleFields: visibleFields,
            };

            const result = await updateModule(module.id, { data: updatedData });

            if (result.success) {
                toast.success("显示配置已更新");
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error("更新失败", { description: result.error });
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>个人简介显示设置</DialogTitle>
                    <DialogDescription>
                        选择在个人简介模块中显示哪些信息（已选中 {visibleCount} 项）
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    {FIELD_DEFINITIONS.map((field) => (
                        <div key={field.key} className="flex items-start gap-3 p-3 rounded-lg border">
                            <Checkbox
                                id={`field-${field.key}`}
                                checked={visibleFields[field.key]}
                                onCheckedChange={(checked) => handleToggleField(field.key, checked)}
                            />
                            <Label htmlFor={`field-${field.key}`} className="cursor-pointer">
                                <span>{field.icon}</span>
                                <span>{field.label}</span>
                                {visibleFields[field.key] ? <Eye /> : <EyeOff />}
                            </Label>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
```

**关键实现**：
1. 使用 `FIELD_DEFINITIONS` 数组管理字段配置
2. 每个字段有图标、标签、描述
3. 使用 `Eye`/`EyeOff` 图标指示状态
4. 保存时保留原有数据，只更新 `visibleFields`

### 3. 集成到 ModuleEditDialog

**文件**: `src/components/features/modules/module-edit-dialog.tsx`

```typescript
import { BioModuleConfigDialog } from "./bio-module-config-dialog";

export function ModuleEditDialog({ module, open, onOpenChange, onSuccess }: ModuleEditDialogProps) {
    const [bioConfigOpen, setBioConfigOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {/* 其他模块类型的编辑表单 */}

                {module.type === "bio" && (
                    <div className="py-8 text-center space-y-4">
                        <div>
                            <p className="text-muted-foreground">
                                个人简介的数据来自"个人信息"页面
                            </p>
                            <p className="text-sm text-muted-foreground">
                                您可以在此配置哪些字段在页面上显示
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <a href="/dashboard/profile">前往个人信息页面</a>
                        </Button>
                        <div className="pt-4 border-t">
                            <Button onClick={() => setBioConfigOpen(true)} className="w-full">
                                配置显示设置
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>

            {/* Bio 模块配置对话框 */}
            <BioModuleConfigDialog
                module={module}
                open={bioConfigOpen}
                onOpenChange={setBioConfigOpen}
                onSuccess={onSuccess}
            />
        </Dialog>
    );
}
```

---

## 问题与解决方案

### 问题 1: Checkbox 组件不存在

**错误信息**:
```
Module not found: Error: Can't resolve '@/components/ui/checkbox'
```

**原因分析**:
shadcn/ui 的 Checkbox 组件未安装

**解决方案**:
```bash
npx shadcn@latest add checkbox --yes
```

**生成文件**: `src/components/ui/checkbox.tsx`

### 问题 2: 类型兼容性

**问题描述**:
现有的 `BioModuleData` 类型不包含 `visibleFields` 字段，导致类型错误

**解决方案**:
- 将 `visibleFields` 设为可选字段 (`?`)
- 提供默认值保持向后兼容

### 问题 3: 预览页面数据缺失

**错误现象**:
预览页面中"关于我"模块没有任何信息显示

**原因分析**:
```typescript
// ❌ 错误：从 session 获取数据，但 session 没有 bio/phone/contact 字段
const userName = session?.user?.name;
const userBio = (session?.user as any)?.bio;  // undefined
const userPhone = (session?.user as any)?.phone;  // undefined
```

NextAuth 的 session 只包含基本用户信息（name, email, image），不包含扩展字段（bio, phone, contact）。

**解决方案**:
```typescript
// ✅ 正确：使用 getUserProfile API 从数据库获取完整数据
const result = await getUserProfile();
if (result.success) {
    setUserData({
        name: result.data.name || null,
        bio: result.data.bio || null,
        avatarUrl: result.data.avatarUrl || null,
        phone: result.data.phone || null,
        contact: result.data.contact || null,
    });
}
```

**修改文件**: `src/app/(dashboard)/dashboard/preview/page.tsx`

### 问题 4: Loading 卡死（P0 Bug）

**错误现象**:
- 第一次进入预览页面正常显示
- 第二次进入预览页面卡在 loading 状态
- 没有任何日志输出

**根本原因**:
```typescript
const hasLoaded = useRef(false);

useEffect(() => {
    if (hasLoaded.current) return;  // ❌ ref 在路由切换时不会重置！
    hasLoaded.current = true;
    // 加载数据...
}, []);
```

**问题流程**:
1. 第一次进入：`hasLoaded.current = false` → 加载数据 → 设置为 `true`
2. 导航到其他页面再返回：`hasLoaded.current` 仍然是 `true`（ref 不会重置）
3. useEffect 看到后提前 return
4. `isLoading` 永远是 `true` → 页面卡死

**解决方案**:
```typescript
// ✅ 正确：移除 hasLoaded，依赖 session?.user?.id 作为依赖
useEffect(() => {
    if (!session?.user?.id) {
        setIsLoading(false);
        return;
    }
    // 加载数据...
}, [session?.user?.id]); // 每次 session 变化时重新执行
```

**修改文件**:
- `src/app/(dashboard)/dashboard/preview/page.tsx`
- `src/components/features/preview/layout-preview.tsx`

### 问题 5: UI 重复显示

**错误现象**:
头像、名字、个人简介显示在了"关于我"模块的外侧

**原因分析**:
`LayoutPreview` 组件有一个 **Profile Header**，在所有模块外侧显示用户信息：

```typescript
{/* Profile Header - 模块外侧 */}
<div className="flex flex-col items-center">
    <Avatar />
    <Name />
    <Bio />
</div>

{/* Module Layout Grid - 模块 */}
<ModuleLayoutGrid />
    <BioModule />  // 也在显示用户信息
```

这导致用户信息重复显示两次。

**解决方案**:
移除 Profile Header 部分，让用户信息只在"关于我"模块内部显示：

```typescript
// ✅ 正确：移除 Profile Header
<PreviewContent>
    {/* Profile Header 已删除 */}
    <ModuleLayoutGrid />
        <BioModule />  // 只在这里显示用户信息
</PreviewContent>
```

**修改文件**: `src/components/features/preview/layout-preview.tsx`

---

## 技术要点总结

### 1. 数据与显示分离

```
数据层 (User 表)
    ↓ 不变
配置层 (Module.visibleFields)
    ↓ 过滤
显示层 (BioModule 渲染)
```

**好处**：
- 数据统一管理
- 显示灵活控制
- 不破坏原有数据

### 2. 默认值模式

```typescript
// 定义默认值
const DEFAULT_VISIBLE_FIELDS: BioVisibleFields = {
  name: true,
  bio: true,
  avatar: true,
  phone: true,
  contact: true,
};

// 使用展开运算符合并
const visibleFields = {
  ...DEFAULT_VISIBLE_FIELDS,
  ...moduleData?.visibleFields,
};
```

**优点**：
- 未配置时全部显示
- 只需覆盖需要修改的字段
- 向后兼容旧数据

### 3. 对话框嵌套

```typescript
<Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
        {/* 主对话框内容 */}
    </DialogContent>

    {/* 嵌套的配置对话框 */}
    <BioModuleConfigDialog
        open={bioConfigOpen}
        onOpenChange={setBioConfigOpen}
    />
</Dialog>
```

**注意**：
- 使用独立的状态管理嵌套对话框
- 父对话框保持打开状态
- 子对话框关闭后刷新父对话框数据

### 4. React Hook Form 模式 vs 本地状态

本实现使用本地状态（`useState`）而非 React Hook Form：

**选择原因**：
- 简单的复选框组，不需要复杂验证
- 减少依赖
- 更直接的状态管理

```typescript
const [visibleFields, setVisibleFields] = useState<BioVisibleFields>(DEFAULT_VISIBLE_FIELDS);

const handleToggleField = (field: keyof BioVisibleFields, checked: boolean) => {
    setVisibleFields((prev) => ({
        ...prev,
        [field]: checked,
    }));
};
```

### 5. useRef 在路由切换时的陷阱 ⚠️

**问题**：`useRef` 的值在路由切换时不会重置！

```typescript
// ❌ 错误：会导致第二次进入页面卡死
const hasLoaded = useRef(false);

useEffect(() => {
    if (hasLoaded.current) return;  // 第二次进入时仍是 true
    hasLoaded.current = true;
    loadData();
}, []);
```

**正确做法**：依赖状态变化，而非 ref

```typescript
// ✅ 正确：依赖 session?.user?.id
useEffect(() => {
    if (!session?.user?.id) return;
    loadData();
}, [session?.user?.id]); // 每次 session 变化时重新执行
```

**关键点**：
- `useRef` 的值在组件整个生命周期中保持不变
- Next.js 客户端路由切换不会重置 ref
- 对于需要重置的状态，使用 `useState` 或依赖 props/state

### 6. NextAuth Session 的局限性

**问题**：NextAuth 的 session 只包含基本用户信息

```typescript
// Session 只包含这些字段
{
  user: {
    name: string;
    email: string;
    image: string;
  }
}
```

**解决方案**：扩展字段需要从数据库查询

```typescript
// ✅ 使用 Server Action 获取完整数据
const result = await getUserProfile();
const { bio, phone, contact } = result.data;
```

---

## 文件清单

### 新建文件

| 文件路径 | 说明 |
|---------|------|
| `src/components/features/modules/bio-module-config-dialog.tsx` | Bio 模块配置对话框 |
| `src/components/ui/checkbox.tsx` | shadcn/ui Checkbox 组件 |
| `DevelopmentDoc/2025-01-16-bio-module-visibility-control.md` | 本开发文档 |

### 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `src/types/index.ts` | 添加 `BioVisibleFields` 接口，扩展 `BioModuleData` |
| `src/lib/validations.ts` | 更新 `bioModuleDataSchema` 添加 `visibleFields` 验证 |
| `src/components/features/modules/bio-module.tsx` | 根据 `visibleFields` 控制字段渲染 |
| `src/components/features/modules/module-edit-dialog.tsx` | 集成 `BioModuleConfigDialog` |
| `src/app/(dashboard)/dashboard/preview/page.tsx` | 使用 `getUserProfile()` API 获取完整数据，移除 `hasLoaded` ref |
| `src/components/features/preview/layout-preview.tsx` | 移除 Profile Header，移除 `hasLoaded` ref，添加日志和超时保护 |
| `CLAUDE.md` | 添加开发文档记录规范 |

---

## 部署检查清单

- [ ] Checkbox 组件已安装
- [ ] TypeScript 编译无错误
- [ ] 所有 bio 模块可以正常渲染（默认全部显示）
- [ ] 配置对话框可以正常打开和关闭
- [ ] 保存配置后模块正确更新显示
- [ ] 个人信息页面数据修改后同步到模块
- [ ] 取消选中字段后该字段不显示
- [ ] 数据本身不被删除

---

## 参考资料

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [shadcn/ui Checkbox](https://ui.shadcn.com/docs/components/checkbox)
- [Zod Validation](https://zod.dev/)
- TypeScript 类型系统

---

**文档版本**: 1.1.0
**最后更新**: 2026-01-16
**维护者**: LinkPro 开发团队

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| 1.0.0 | 2026-01-16 | 初始版本 - 字段可见性控制功能 |
| 1.1.0 | 2026-01-16 | 补充问题 3-5：数据加载、Loading 卡死、UI 重复显示 |
