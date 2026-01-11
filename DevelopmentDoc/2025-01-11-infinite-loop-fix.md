# 无限循环导致应用卡死 - 问题修复记录

**日期**: 2025-01-11
**严重程度**: 严重
**状态**: 已解决

---

## 问题现象

应用启动后完全无响应：
- 浏览器控制台无任何警告或报错
- 源代码窗口看不到任何内容
- 应用程序看不到任何本地存储和会话存储
- 网络面板没有任何请求返回
- 页面白屏，完全无法交互

---

## 根本原因

### 1. useEffect 无限依赖循环

**位置**: `src/components/features/preview/layout-preview.tsx`

**问题代码**:
```typescript
useEffect(() => {
    async function loadData() {
        // ...
        await setModules(modulesResult.data);
    }
    loadData();
}, [session?.user?.id, setModules]); // ❌ setModules 导致无限循环
```

**问题分析**:
- `setModules` 是从 Zustand store 解构的函数
- Zustand store 的函数引用每次渲染都会变化
- 导致 useEffect 无限触发
- 每次触发都调用 Server Actions (`getModules`, `getUserLinks`)
- `setModules` 内部调用 `getDeviceLayouts()` Server Action
- 状态更新 → 重新渲染 → useEffect 再次触发 → 无限循环

### 2. 缺少错误处理

**位置**: `src/stores/layout-store.ts`

**问题代码**:
```typescript
setModules: async (modules: PageModule[]) => {
    const layoutsResult = await getDeviceLayouts();
    // 如果失败，没有错误处理
    // 直接抛出异常导致应用崩溃
}
```

### 3. 缺少防重复加载机制

多个组件的 useEffect 没有防止重复加载的机制，导致同一个请求被多次触发。

---

## 解决方案

### 1. 修复 useEffect 依赖项

**文件**: `src/components/features/preview/layout-preview.tsx`

```typescript
// ✅ 正确做法
const hasLoaded = useRef(false);

useEffect(() => {
    // 防止重复加载
    if (hasLoaded.current) return;
    if (!session?.user?.id) return;

    hasLoaded.current = true;

    let isMounted = true;

    async function loadData() {
        try {
            // ... 加载逻辑
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    }

    loadData();

    return () => {
        isMounted = false;
    };
}, [session?.user?.id]); // ✅ 只使用稳定的依赖
```

**关键点**:
1. 使用 `useRef` 防止重复加载
2. 移除不稳定的函数依赖（`setModules`）
3. 添加 `isMounted` 标志防止组件卸载后更新状态
4. 添加 cleanup 函数

### 2. 添加错误处理

**文件**: `src/stores/layout-store.ts`

```typescript
// ✅ 正确做法
setModules: async (modules: PageModule[]) => {
    try {
        const layoutsResult = await getDeviceLayouts().catch(() => ({ success: false }));

        let mobileLayout: LayoutItem[];

        if (layoutsResult.success && layoutsResult.data.mobileLayout) {
            // 使用保存的布局
        } else {
            // 生成默认布局
            mobileLayout = generateDefaultLayout(moduleData, 'mobile');
        }

        set({ modules, layout: mobileLayout, mobileLayout });
    } catch (error) {
        console.error("setModules error:", error);
        // 如果出错，使用默认布局而不是崩溃
        const mobileLayout = generateDefaultLayout(moduleData, 'mobile');
        set({ modules, layout: mobileLayout, mobileLayout });
    }
}
```

### 3. 添加内存泄漏保护

在所有使用 useEffect + 异步操作的组件中添加：

```typescript
useEffect(() => {
    let isMounted = true;

    async function loadData() {
        try {
            const result = await someAsyncAction();
            if (isMounted) {
                // 只在组件仍然挂载时更新状态
                setState(result.data);
            }
        } catch (error) {
            console.error("Failed to load:", error);
            if (isMounted) {
                // 确保即使出错也停止加载状态
                setIsLoading(false);
            }
        }
    }

    loadData();

    return () => {
        isMounted = false; // 清理标志
    };
}, [/* 稳定的依赖项 */]);
```

---

## 修复的文件清单

| # | 文件 | 问题 | 修复 |
|---|------|------|------|
| 1 | `src/components/features/preview/layout-preview.tsx` | 无限循环 | 添加 hasLoaded ref，移除 setModules 依赖 |
| 2 | `src/stores/layout-store.ts` | 缺少错误处理 | 添加 try-catch，失败时使用默认布局 |
| 3 | `src/components/features/publish/publish-status.tsx` | 内存泄漏 | 添加 isMounted 标志和 cleanup |
| 4 | `src/app/(dashboard)/dashboard/page.tsx` | 内存泄漏 | 添加 isMounted 标志和 cleanup |
| 5 | `src/app/(dashboard)/dashboard/layout-editor/page.tsx` | 内存泄漏 | 添加 isMounted 标志和 cleanup |
| 6 | `src/app/(dashboard)/dashboard/profile/page.tsx` | 内存泄漏 | 添加 isMounted 标志和 cleanup |
| 7 | `src/components/features/modules/module-edit-dialog.tsx` | Promise 无清理 | 添加 isMounted 标志和 catch |

---

## 预防措施

### 1. useEffect 依赖项规范

**❌ 错误 - 不稳定的函数依赖**:
```typescript
const { setItems } = useStore();

useEffect(() => {
    setItems(data);
}, [setItems]); // setItems 每次渲染都变化
```

**✅ 正确 - 稳定的依赖**:
```typescript
const { setItems } = useStore();

useEffect(() => {
    setItems(data);
}, []); // 移除函数依赖，或使用 useCallback 包装
```

### 2. Zustand Store 使用规范

**❌ 错误 - 直接解构会导致引用变化**:
```typescript
const { items, setItems } = useStore();

useEffect(() => {
    setItems(data);
}, [setItems]); // 无限循环
```

**✅ 正确 - 选择性订阅**:
```typescript
const items = useStore(state => state.items);
const setItems = useStore(state => state.setItems);

// 或者使用单独的 hooks
const items = useItems();
const setItems = useSetItems();
```

### 3. 异步操作规范

所有 useEffect 中的异步操作必须包含：

1. **isMounted 标志** - 防止组件卸载后更新状态
2. **try-catch** - 捕获错误防止崩溃
3. **finally 块** - 确保加载状态正确更新
4. **cleanup 函数** - 清理副作用

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
        isMounted = false;
    };
}, [/* 稳定依赖 */]);
```

### 4. 防重复加载模式

对于只需要执行一次的副作用：

```typescript
const hasLoaded = useRef(false);

useEffect(() => {
    if (hasLoaded.current) return;

    hasLoaded.current = true;
    // 执行一次性逻辑...
}, [/* 依赖 */]);
```

---

## 检查清单

在添加或修改 useEffect 时，检查以下项目：

- [ ] 依赖项是否稳定？（函数、对象、数组需要 useMemo/useCallback）
- [ ] 是否添加了 isMounted 标志防止内存泄漏？
- [ ] 是否添加了 try-catch 处理错误？
- [ ] 是否添加了 finally 确保 loading 状态正确？
- [ ] 是否添加了 cleanup 函数？
- [ ] 是否需要防重复加载机制？
- [ ] Zustand store 的函数是否会导致循环？

---

## 相关资源

- [React Hooks 依赖项规则](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)
- [Zustand 最佳实践](https://docs.pmnd.rs/zustand/guides/prevent-rerenders-with-selectors)
- [useEffect 完整指南](https://overreacted.io/a-complete-guide-to-useeffect/)
