# Zustand Stores 代码审查报告

## 概述

本报告审查 LinkPro 项目中的 Zustand 状态管理实现，重点关注无限循环风险、数据重复获取和最佳实践。

**审查日期**: 2026-01-29
**审查范围**: `src/stores/` 目录

---

## 目录

1. [layout-store.ts](#layout-storets)
2. [auth-store.ts](#auth-storets)
3. [user-store.ts](#user-storets)
4. [editor-store.ts](#editor-storets)

---

## layout-store.ts

### 文件信息
- **路径**: `src/stores/layout-store.ts`
- **行数**: 170 行
- **状态**: ⚠️ 需要改进

### 问题分析

#### 1. ✅ 正确的 Selector Hooks 导出 (已修复)

**当前实现** (第 146-162 行):
```typescript
// Selector hooks for optimized re-renders
export const useModules = () => useLayoutStore((state) => state.modules);
export const useLayout = () => useLayoutStore((state) => state.layout);
// ... 其他 selectors

// Action hooks - 分别导出每个 action selector 以获得稳定的引用
export const useSetModules = () => useLayoutStore((state) => state.setModules);
export const useUpdateLayout = () => useLayoutStore((state) => state.updateLayout);
```

**评价**: ✅ 正确实现
- 导出了稳定的 selector hooks
- 避免了组件直接解构整个 store 导致的引用变化
- 符合 Vercel React Best Practices 中的 `rerender-dependencies` 规则

#### 2. ⚠️ setModules 函数中的异步操作复杂度

**问题** (第 43-96 行):
```typescript
setModules: async (modules: PageModule[]) => {
  try {
    const layoutsResult = await getDeviceLayouts().catch(() => ({ success: false }));
    // ... 复杂的布局计算逻辑
  } catch (error) {
    // ...
  }
}
```

**问题分析**:
1. **混合职责**: Store 中直接调用 Server Action 违反了单一职责原则
2. **错误处理**: 使用 `.catch(() => ({ success: false }))` 吞掉了错误
3. **性能**: 每次调用 `setModules` 都会触发网络请求

**建议改进**:
```typescript
// 分离数据获取和状态管理
// 在组件或 service 层处理数据获取
setModules: (modules: PageModule[], layout?: LayoutItem[]) => {
  const mobileLayout = layout ?? generateDefaultLayout(modules, 'mobile');
  set({ modules, layout: mobileLayout, mobileLayout });
},
```

#### 3. ⚠️ 类型断言过多

**问题** (第 50-53 行):
```typescript
const data = (layoutsResult as { success: true; data: { mobileLayout: LayoutItem[] | null; desktopLayout: LayoutItem[] | null } }).data;
```

**问题分析**:
- 使用类型断言绕过 TypeScript 类型检查
- 降低类型安全性

---

## auth-store.ts

### 文件信息
- **路径**: `src/stores/auth-store.ts`
- **行数**: 110 行
- **状态**: ✅ 良好

### 评价

#### ✅ 正确使用 Persist 中间件

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: 'linkpro-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        loginExpiry: state.loginExpiry,
      }),
    }
  )
);
```

- 正确使用 `partialize` 只持久化必要字段
- 使用 `createJSONStorage` 确保类型安全

#### ✅ 会话验证逻辑清晰

```typescript
isSessionValid: () => {
  const state = get();
  if (!state.rememberMe) {
    return false;
  }
  // ...
}
```

---

## user-store.ts

### 文件信息
- **路径**: `src/stores/user-store.ts`
- **行数**: 34 行
- **状态**: ⚠️ 实现不完整

### 问题分析

#### 1. ❌ 几乎未使用

**发现**:
- Store 定义了 `profile` 和 `projects` 状态
- 但在代码中几乎没有被使用
- 大多数组件直接从 Server Actions 获取数据

#### 2. ⚠️ 缺少 Selector Hooks

```typescript
export const useUserStore = create<UserState>((set) => ({
  profile: { /* ... */ },
  projects: [],
  setUserProfile: (profile) => set({ profile }),
  // ...
}));

// 缺少 selector hooks 导出
```

**建议**:
```typescript
export const useUserProfile = () => useUserStore((state) => state.profile);
export const useUserProjects = () => useUserStore((state) => state.projects);
export const useSetUserProfile = () => useUserStore((state) => state.setUserProfile);
```

---

## editor-store.ts

### 文件信息
- **路径**: `src/stores/editor-store.ts`
- **行数**: 143 行
- **状态**: ✅ 良好

### 评价

#### ✅ 正确的 Selector Hooks 导出

```typescript
// Selector hooks for optimized re-renders
export const useLinks = () => useEditorStore((state) => state.links);
export const useTheme = () => useEditorStore((state) => state.theme);

// Action hooks - 分别导出每个 action selector 以获得稳定的引用
export const useAddLink = () => useEditorStore((state) => state.addLink);
export const useUpdateLink = () => useEditorStore((state) => state.updateLink);
// ...
```

#### ✅ 不可变更新模式

```typescript
addLink: (link) => {
  set((state) => ({
    links: [...state.links, newLink],
    isDirty: true,
  }));
},
```

---

## 总体建议

### 1. 数据获取策略需要统一

**当前问题**:
- 数据在多个地方重复获取（组件 useEffect、Store 初始化）
- 没有统一的数据获取入口

**建议架构**:
```
┌─────────────────────────────────────────┐
│          Dashboard Layout (Server)      │
│  ┌───────────────────────────────────┐  │
│  │   Initial Data Fetch (SSR)       │  │
│  │   - getModules()                 │  │
│  │   - getUserLinks()               │  │
│  │   - getUserProfile()             │  │
│  └───────────────────────────────────┘  │
│                 ↓                        │
│  ┌───────────────────────────────────┐  │
│  │   Initialize Stores with Data    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 2. 移除 Store 中的 Server Actions 调用

**当前问题**:
- `layout-store.ts` 的 `setModules` 中直接调用 `getDeviceLayouts()`

**建议**:
```typescript
// ❌ 当前
setModules: async (modules) => {
  const layouts = await getDeviceLayouts();
  // ...
}

// ✅ 建议
// 在组件或 service 层
const [modules, layouts] = await Promise.all([
  getModules(),
  getDeviceLayouts()
]);
useLayoutStore.getState().setModules(modules, layouts);
```

### 3. 添加数据缓存层

考虑使用 React Cache 或 SWR:
```typescript
import { cache } from 'react';

export const getModules = cache(async () => {
  // 服务器端自动去重
});
```

### 4. 使用 user-store.ts

当前 `user-store.ts` 几乎未被使用，建议：
- 在 Dashboard Layout 加载时初始化用户数据
- 各组件从 store 读取而非重复调用 API

---

## 优先级修复列表

| 优先级 | 问题 | 文件 | 行数 |
|--------|------|------|------|
| 🔴 高 | 移除 Store 中的 Server Actions | `layout-store.ts` | 43-96 |
| 🔴 高 | 统一数据获取策略 | 多处 | - |
| 🟡 中 | 使用 user-store 缓存用户数据 | 多处 | - |
| 🟡 中 | 移除类型断言 | `layout-store.ts` | 50-53 |
| 🟢 低 | 添加 user-store selector hooks | `user-store.ts` | 全部 |

---

## 相关 Vercel React Best Practices 违规

1. **client-swr-dedup**: 缺少请求去重机制
2. **async-parallel**: 数据获取可以并行化
3. **rerender-dependencies**: 部分组件存在不稳定的依赖

---

**审查人员**: Claude AI
**最后更新**: 2026-01-29
