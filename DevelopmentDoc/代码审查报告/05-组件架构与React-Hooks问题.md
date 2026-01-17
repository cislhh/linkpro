# 组件架构与 React Hooks 问题报告

**审查日期**: 2026-01-17
**审查范围**: 组件文件和 React Hooks 使用

---

## 问题列表

### 1. module-edit-dialog.tsx 中 useEffect 依赖项被禁用

**文件**: `src/components/features/modules/module-edit-dialog.tsx`
**行号**: 92, 119

**问题描述**:
使用 `eslint-disable-next-line` 禁用了 React Hooks 依赖项检查，这是掩盖问题而非解决问题。

**当前代码**:
```typescript
}, [open, module?.type]);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [open, module?.type]);
```

**问题分析**:
- 禁用 eslint 规则可能导致潜在 bug
- 代码审查者无法判断这是有意为之还是疏忽
- 未来维护者可能不理解为什么禁用规则

**修改建议**:
如果确实不需要某些依赖，添加解释注释；否则修复依赖项

**修改思路**:
```typescript
// 方案1: 添加详细注释
useEffect(() => {
    // 只在对话框打开且模块类型变化时重新加载
    // userLinks 和 userProjects 在外部管理，不需要作为依赖
    // ...
}, [open, module?.type]); // OK: 用户链接和项目状态在外部管理

// 方案2: 使用 useRef 保存最新值
const userLinksRef = useRef(userLinks);
userLinksRef.current = userLinks;

useEffect(() => {
    // 使用 ref 获取最新值
    const links = userLinksRef.current;
    // ...
}, [open, module?.type]);
```

---

### 2. profile-form.tsx 中存在重复的类型转换

**文件**: `src/components/features/profile/profile-form.tsx`
**行号**: 21-24, 137, 180

**问题描述**:
在 profile-form.tsx 中重新定义了 `profileFormSchema`，与 `validations.ts` 中的 `updateProfileSchema` 重复。

**当前代码**:
```typescript
// profile-form.tsx:21
const profileFormSchema = updateProfileSchema.extend({
  phone: z.string().regex(/^[+]?[\d\s\-()]*$/, "电话号码格式无效").max(50, "电话号码过长").optional().or(z.literal("")),
  contact: z.string().max(200, "联系方式过长").optional().or(z.literal("")),
});
```

**问题分析**:
- phone 和 contact 的验证规则在两处定义
- 如果修改一处，另一处不会同步
- `.or(z.literal(""))` 的语义问题

**修改建议**:
统一在 `validations.ts` 中定义验证规则

**修改思路**:
```typescript
// validations.ts - 修改 updateProfileSchema
export const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal('')),
  phone: z.string()
    .regex(/^[+]?[\d\s\-()]*$/, '电话号码格式无效')
    .max(50, '电话号码过长')
    .optional()
    .or(z.literal('')),
  contact: z.string()
    .max(200, '联系方式过长')
    .optional()
    .or(z.literal('')),
  projects: z.array(projectSchema).max(50, 'Too many projects').optional().or(z.literal(null)),
});

// profile-form.tsx - 直接使用
import { updateProfileSchema } from "@/lib/validations";

const form = useForm<ProfileFormValues>({
  resolver: zodResolver(updateProfileSchema),
  // ...
});
```

---

### 3. layout-grid.tsx 中使用 `any` 类型绕过类型检查

**文件**: `src/components/features/layout-editor/layout-grid.tsx`
**行号**: 71, 117

**问题描述**:
使用 `eslint-disable-next-line` 和 `any` 类型绕过类型检查。

**当前代码**:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleLayoutChange = useCallback((newLayout: any[]) => {
    // ...
}, [updateLayout, onLayoutChange]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gridProps: any = {
    // ...
};
```

**问题分析**:
- 使用 `any` 失去了类型安全
- 注释说"类型定义过时"，但没有创建正确的类型定义
- 可能在运行时出现类型错误

**修改建议**:
为 react-grid-layout 创建正确的类型定义

**修改思路**:
```typescript
// types/index.ts 或新文件 types/react-grid-layout.d.ts
export interface RGLLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export interface RGLLayout {
  lg?: RGLLayoutItem[];
  md?: RGLLayoutItem[];
  sm?: RGLLayoutItem[];
  xs?: RGLLayoutItem[];
  xxs?: RGLLayoutItem[];
}

// layout-grid.tsx - 使用正确类型
const handleLayoutChange = useCallback((newLayout: RGLLayoutItem[]) => {
  const layoutItems: LayoutItem[] = newLayout.map((item) => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
    maxW: item.maxW,
    maxH: item.maxH,
  }));

  updateLayout(layoutItems);
  onLayoutChange?.(layoutItems);
}, [updateLayout, onLayoutChange]);
```

---

### 4. layout-preview.tsx 中的魔法数字

**文件**: `src/components/features/preview/layout-preview.tsx`
**行号**: 77, 140, 142, 150, 176

**问题描述**:
存在多个魔法数字，降低了代码可读性和可维护性。

**当前代码**:
```typescript
// 超时保护 10 秒
timeoutId = setTimeout(() => {
    // ...
}, 10000);

// 网格配置
const cols = 2;
const rowHeight = 80;
const gap = 16;

// 容器宽度
deviceMode === "mobile" ? "w-[375px]" : "w-full"
```

**问题分析**:
- 魔法数字的含义不明确
- 修改时需要在多处查找替换
- 容易出错

**修改建议**:
提取常量到文件顶部或单独的常量文件

**修改思路**:
```typescript
// 组件顶部定义常量
const MOBILE_WIDTH = 375;
const GRID_COLUMNS = 2;
const GRID_ROW_HEIGHT = 80;
const GRID_GAP = 16;
const LOADING_TIMEOUT = 10000; // 10 seconds
const MIN_PREVIEW_HEIGHT = 600;

// 使用常量
timeoutId = setTimeout(() => {
    // ...
}, LOADING_TIMEOUT);

const cols = GRID_COLUMNS;
const rowHeight = GRID_ROW_HEIGHT;
const gap = GRID_GAP;

// 或使用 Tailwind config
className={`w-[${MOBILE_WIDTH}px]`}
```

---

### 5. layout-grid.tsx 中 SSR 检测方式不优雅

**文件**: `src/components/features/layout-editor/layout-grid.tsx`
**行号**: 45-53, 86-91

**问题描述**:
使用 `mounted` 状态来处理 SSR 问题，这会导致内容闪烁。

**当前代码**:
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
    setMounted(true);
}, []);

if (!mounted) {
    return (
        <div className={cn("min-h-[400px] bg-muted/30 rounded-lg animate-pulse", className)} />
    );
}
```

**问题分析**:
- 首次渲染显示骨架屏，然后切换到实际内容
- 用户体验不佳
- 可以使用更好的方式处理 SSR

**修改建议**:
使用 `useIsSSR` hook 或条件渲染

**修改思路**:
```typescript
// 创建自定义 hook
// src/hooks/use-is-ssr.ts
import { useEffect, useState } from "react";

export function useIsSSR() {
  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
  }, []);

  return isSSR;
}

// 在组件中使用
const isSSR = useIsSSR();

if (isSSR) {
    return <LoadingSkeleton />;
}

// 或使用动态导入
const LayoutGrid = dynamic(() => import('./layout-grid'), {
    ssr: false,
    loading: () => <LoadingSkeleton />
});
```

---

### 6. Button 组件中使用 `asChild` 但未正确类型检查

**文件**: `src/components/features/modules/module-edit-dialog.tsx`
**行号**: 232, 258, 320

**问题描述**:
使用 `Button asChild` 渲染链接，但没有正确处理类型。

**当前代码**:
```typescript
<Button asChild variant="outline" className="mb-4">
    <a href="/dashboard/profile">前往个人信息页面</a>
</Button>
```

**问题分析**:
- 如果 `href` 是动态的且可能为空，会导致渲染问题
- 应该添加条件检查

**修改建议**:
确保 `href` 始终有效，或条件渲染

**修改思路**:
```typescript
// 确保链接有效
<Button asChild variant="outline" className="mb-4">
    <Link href="/dashboard/profile">前往个人信息页面</Link>
</Button>

// 或条件渲染
{canNavigate && (
    <Button asChild variant="outline" className="mb-4">
        <a href="/dashboard/profile">前往个人信息页面</a>
    </Button>
)}
```

---

### 7. 缺少关键组件的 PropTypes 或 TypeScript 接口导出

**文件**: 多个组件文件
**行号**: N/A

**问题描述**:
一些组件的 props 接口没有导出，导致外部无法复用类型。

**影响**:
- 测试时需要重复定义类型
- 组件使用者无法获得良好的类型提示

**修改建议**:
导出所有组件的 props 接口

---

## 严重程度评级

| 问题 | 严重程度 | 影响范围 |
|-----|---------|---------|
| 禁用 eslint 规则 | 低 | 代码质量 |
| 重复类型定义 | 中 | 维护性 |
| 使用 any 类型 | 中 | 类型安全 |
| 魔法数字 | 低 | 可读性 |
| SSR 处理 | 低 | 用户体验 |
| asChild 类型 | 低 | 类型安全 |
| 未导出接口 | 低 | 开发体验 |

---

## 建议修复优先级

1. **中优先级**: 问题 #2 (重复类型定义) - 统一验证规则
2. **中优先级**: 问题 #3 (any 类型) - 恢复类型安全
3. **低优先级**: 问题 #1、#4、#5、#6、#7 - 代码质量改进

---

## 相关文件清单

- `src/components/features/modules/module-edit-dialog.tsx`
- `src/components/features/profile/profile-form.tsx`
- `src/components/features/layout-editor/layout-grid.tsx`
- `src/components/features/preview/layout-preview.tsx`
- `src/lib/validations.ts`
