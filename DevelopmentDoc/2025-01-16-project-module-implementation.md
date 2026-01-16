# 项目展示模块 - 完整开发文档

## 概述

本文档记录了"个人信息中新增项目展示模块"功能的完整开发过程，包括需求分析、技术设计、实现细节以及遇到的问题和解决方案。

**开发日期**: 2025-01-16
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

### 用户需求

1. **个人信息页面新增项目管理功能**
   - 用户可以在个人信息页面添加、编辑、删除个人项目
   - 支持拖拽排序
   - 每个项目包含：名称、描述、链接、图片 URL、标签

2. **页面管理中项目模块的配置**
   - 点击修改按钮后显示配置弹窗
   - 弹窗内容是勾选想要展示的项目
   - 类似链接模块的逻辑

### 功能分析

| 功能 | 描述 |
|------|------|
| 项目数据存储 | 存储在 User 表的 projects 字段（Json 类型） |
| 项目展示 | 通过 ProjectsModule 组件展示选中的项目 |
| 项目配置 | 在页面管理中勾选要展示的项目 ID |
| 项目管理 | 在个人信息页面进行 CRUD 操作 |

---

## 技术设计

### 数据库设计

#### User 模型扩展

```prisma
model User {
  // ... 其他字段
  projects      Json?     // 个人项目列表
  // ...
}
```

**设计决策**:
- 使用 `Json` 类型而非创建独立的 Project 表
- 原因：项目数据与用户强关联，不需要跨用户查询
- 简化数据查询逻辑，减少 JOIN 操作

### 类型定义设计

#### Project 接口

```typescript
export interface Project {
  id: string;           // 唯一标识符
  name: string;         // 项目名称
  description: string;  // 项目描述
  url: string | null;   // 项目链接
  imageUrl: string | null; // 图片 URL
  tags: string[];       // 标签数组
}
```

#### ProjectsModuleData 结构变更

**原设计**:
```typescript
export interface ProjectsModuleData {
  type: 'projects';
  projects: Project[];  // 直接存储项目数据
}
```

**新设计**:
```typescript
export interface ProjectsModuleData {
  type: 'projects';
  projectIds: string[]; // 引用 User.projects 的 ID
}
```

**变更原因**:
- 数据单一真实来源（Single Source of Truth）
- 项目数据在 User.projects，模块只需存储引用
- 与 LinksModule 设计保持一致

### 组件架构

```
src/components/features/
├── project-editor/          # 项目管理组件
│   ├── project-list.tsx     # 项目列表（支持拖拽）
│   ├── project-item.tsx     # 单个项目卡片
│   ├── project-form.tsx     # 添加/编辑表单
│   └── index.ts
└── modules/
    ├── projects-module.tsx              # 项目展示模块
    ├── projects-module-config-dialog.tsx # 项目配置弹窗
    └── module-edit-dialog.tsx           # 集成配置弹窗
```

---

## 实现细节

### 1. 数据库迁移

**迁移文件**: `prisma/migrations/20260116121857_add_user_projects/migration.sql`

```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "projects" JSONB;
```

**执行命令**:
```bash
npx prisma migrate dev --name add_user_projects
```

### 2. 验证模式更新

#### projectSchema 位置调整

由于 `updateProfileSchema` 需要引用 `projectSchema`，需要将其定义移到文件前面：

```typescript
// src/lib/validations.ts

// Project schema - defined early for use in updateProfileSchema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required').max(100, 'Project name too long'),
  description: z.string().max(500, 'Description too long'),
  url: z.string().url('Invalid URL').nullable().optional(),
  imageUrl: z.string().url('Invalid image URL').nullable().optional(),
  tags: z.array(z.string().max(30, 'Tag too long')).max(10, 'Too many tags'),
});
```

#### projectsModuleDataSchema 更新

```typescript
export const projectsModuleDataSchema = z.object({
  type: z.literal('projects'),
  projectIds: z.array(z.string()).max(20, 'Too many projects to display'),
});
```

### 3. Server Actions

#### updateUserProjects

```typescript
export async function updateUserProjects(
  projects: Project[]
): Promise<ActionResult<UserResult>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "需要认证" };
    }

    const validated = updateProfileSchema.parse({ projects });

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { projects: validated.projects },
      select: { /* ... */ },
    });

    return { success: true, data: user };
  } catch (error) {
    // 错误处理...
  }
}
```

### 4. 项目管理组件

#### ProjectList 组件

关键实现点：
- 使用 `@dnd-kit` 实现拖拽排序
- Optimistic UI 更新
- Server Action 调用错误处理

```typescript
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);

    // Optimistically update the UI
    const newProjects = arrayMove(projects, oldIndex, newIndex);
    setProjects(newProjects);

    // Persist to database
    await saveProjects(newProjects);
  }
};
```

#### ProjectItem 组件

- 显示项目预览（图片、名称、描述、标签）
- 拖拽手柄
- 编辑/删除按钮

#### ProjectForm 组件

- 支持「添加」和「编辑」两种模式
- Zod 验证
- URL 格式验证

### 5. 项目模块配置弹窗

#### ProjectsModuleConfigDialog

设计特点：
- 显示用户所有项目
- 勾选要展示的项目
- 显示选中数量
- 项目卡片预览

```typescript
export function ProjectsModuleConfigDialog({
    module,
    userProjects,
    open,
    onOpenChange,
    onSuccess,
}: ProjectsModuleConfigDialogProps) {
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // 从模块数据中获取已选中的项目 ID
  useEffect(() => {
    if (!module) return;
    const moduleData = module.data as ProjectsModuleData;
    setSelectedProjectIds(moduleData?.projectIds || []);
  }, [module?.id, module?.updatedAt]);

  // 保存选中的项目 ID
  const handleSubmit = async () => {
    const updatedData: ProjectsModuleData = {
      type: "projects",
      projectIds: selectedProjectIds,
    };
    const result = await updateModule(module.id, { data: updatedData });
    // ...
  };
}
```

### 6. ProjectsModule 组件更新

添加 `userProjects` prop，支持从 User 数据获取项目：

```typescript
export function ProjectsModule({
    module,
    userProjects,  // 新增
    className,
    isPreview = false
}: ProjectsModuleProps) {
  const moduleData = module.data as ProjectsModuleData;

  // Use user projects if available, otherwise fall back to module data (legacy)
  let projects: Project[] = [];
  if (userProjects && moduleData.projectIds) {
    // Filter user projects by selected IDs
    projects = userProjects.filter((p) => moduleData.projectIds.includes(p.id));
  } else if ((moduleData as any).projects) {
    // Legacy fallback
    projects = (moduleData as any).projects || [];
  }
  // ...
}
```

### 7. module-edit-dialog 集成

变更项目模块的处理方式，从直接编辑项目改为配置弹窗：

**原设计**:
- 显示项目编辑表单
- 每个项目的所有字段都可编辑

**新设计**:
- 显示配置按钮
- 打开 ProjectsModuleConfigDialog
- 勾选要展示的项目

```typescript
{module.type === "projects" && (
  <div className="py-8 text-center space-y-4">
    <div>
      <p className="text-muted-foreground mb-2">
        项目数据来自"个人信息"页面
      </p>
      <p className="text-sm text-muted-foreground">
        您可以在此勾选想要展示的项目
      </p>
    </div>
    <Button asChild variant="outline" className="mb-4">
      <a href="/dashboard/profile">前往个人信息页面</a>
    </Button>
    <div className="pt-4 border-t">
      {projectsLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : userProjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          暂无项目，请先添加项目
        </p>
      ) : (
        <Button
          type="button"
          onClick={() => setProjectsConfigOpen(true)}
          className="w-full"
        >
          配置展示项目 ({userProjects.length} 个可用)
        </Button>
      )}
    </div>
  </div>
)}
```

---

## 问题与解决方案

### 问题 1: Zod Schema 循环引用

**问题描述**: `updateProfileSchema` 需要引用 `projectSchema`，但 `projectSchema` 定义在文件后面。

**解决方案**: 将 `projectSchema` 定义移到文件前面，在 `updateProfileSchema` 之前。

### 问题 2: useEffect 依赖项

**问题描述**: 在 `module-edit-dialog.tsx` 中加载用户项目时，需要注意 useEffect 的依赖项设置，避免无限循环。

**解决方案**:
```typescript
useEffect(() => {
  let isMounted = true;

  if (open && module?.type === "projects" && userProjects.length === 0) {
    setProjectsLoading(true);
    getUserProfile().then((result) => {
      if (isMounted) {
        if (result.success && result.data.projects) {
          setUserProjects(result.data.projects);
        }
        setProjectsLoading(false);
      }
    });
  }

  return () => {
    isMounted = false;
  };
  // 只依赖 open 和 module?.type，避免无限循环
}, [open, module?.type]);
```

### 问题 3: 数据兼容性

**问题描述**: 更改 `ProjectsModuleData` 结构后，现有的项目模块数据（直接存储 projects 数组）可能无法正常显示。

**解决方案**: 在 `ProjectsModule` 组件中添加 legacy fallback：

```typescript
if (userProjects && moduleData.projectIds) {
  // New format: filter by IDs
  projects = userProjects.filter((p) => moduleData.projectIds.includes(p.id));
} else if ((moduleData as any).projects) {
  // Legacy fallback: direct project data
  projects = (moduleData as any).projects || [];
}
```

### 问题 4: 项目没有在预览页面显示（数据流断裂）

**问题描述**: 配置项目后，项目没有在布局编辑器和预览页面的项目模块中显示。

**根本原因**: 数据流断裂 - `userProjects` 没有从 `getUserProfile()` 传递到 `ProjectsModule` 组件。

**数据流问题**:
```
User.projects (数据库)
    ↓ ❌ 断裂
getUserProfile() 未被调用
    ↓ ❌ 断裂
LayoutGrid 没有 userProjects prop
    ↓ ❌ 断裂
ModuleCard 没有 userProjects prop
    ↓ ❌ 断裂
ProjectsModule 没有收到 userProjects
```

**解决方案**: 修复数据流，在所有中间组件中传递 `userProjects`：

1. **layout-editor/page.tsx** - 加载并传递 `userProjects`
```typescript
const [userProjects, setUserProjects] = useState<Project[]>([]);

useEffect(() => {
  const [modulesResult, linksResult, profileResult] = await Promise.all([
    getModules(),
    getUserLinks(),
    getUserProfile(), // 加载用户项目
  ]);

  if (profileResult.success && profileResult.data.projects) {
    setUserProjects(profileResult.data.projects);
  }
}, [session?.user?.id]);

<LayoutGrid modules={modules} links={links} userProjects={userProjects} />
```

2. **layout-grid.tsx** - 接收并传递 `userProjects`
```typescript
interface LayoutGridProps {
  modules: PageModule[];
  links: Link[];
  userProjects?: Project[];  // 新增
  // ...
}

<ModuleCard module={module} links={links} userProjects={userProjects} />
```

3. **module-card.tsx** - 接收并传递 `userProjects`
```typescript
interface ModuleCardProps {
  module: PageModule;
  links: Link[];
  userProjects?: Project[];  // 新增
  // ...
}

<ProjectsModule module={module} userProjects={userProjects} isPreview={isPreview} />
```

4. **layout-preview.tsx** - 同样处理预览页面
```typescript
const [userProjects, setUserProjects] = useState<Project[]>([]);

useEffect(() => {
  const [modulesResult, linksResult, profileResult] = await Promise.all([
    getModules(),
    getUserLinks(),
    getUserProfile(),
  ]);

  if (profileResult.success && profileResult.data.projects) {
    setUserProjects(profileResult.data.projects);
  }
}, [session?.user?.id]);

<ModuleLayoutGrid
  modules={modules}
  links={links}
  userProjects={userProjects}  // 新增
/>
```

### 问题 5: bio 和 projects 模块的保存按钮没有用

**问题描述**: 页面管理中，bio 和 projects 模块的修改弹窗显示"保存"按钮，但点击没有作用（因为这两个模块使用配置弹窗，不通过主对话框保存）。

**解决方案**: 隐藏 bio 和 projects 模块的保存按钮，只显示"关闭"按钮：

```typescript
<DialogFooter>
  {module.type === "bio" || module.type === "projects" ? (
    // bio 和 projects 模块只显示关闭按钮，因为使用配置弹窗
    <Button variant="outline" onClick={() => onOpenChange(false)}>
      关闭
    </Button>
  ) : (
    // skills 和 links 模块显示保存按钮
    <>
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        取消
      </Button>
      <Button onClick={handleSubmit}>保存</Button>
    </>
  )}
</DialogFooter>
```

**修改后的行为**:
| 模块类型 | 按钮显示 |
|---------|---------|
| bio | 只显示"关闭"按钮 |
| projects | 只显示"关闭"按钮 |
| skills | "取消" + "保存"按钮 |
| links | "取消" + "保存"按钮 |

---

## 技术要点总结

### DO (推荐做法)

1. **单一数据源**: 项目数据只存储在 User.projects，模块只存储引用 ID
2. **类型安全**: 使用 Zod 进行运行时验证，TypeScript 进行编译时检查
3. **Optimistic UI**: 拖拽排序时立即更新 UI，然后异步保存
4. **错误处理**: 所有 Server Action 调用都包含 try-catch
5. **isMounted 标志**: useEffect 中使用 isMounted 防止组件卸载后更新状态
6. **一致性设计**: ProjectsModule 与 LinksModule 保持相同的设计模式

### DON'T (避免做法)

1. **不要在模块中存储完整项目数据** - 这会导致数据冗余和同步问题
2. **不要忽略错误处理** - Server Action 可能失败
3. **不要跳过数据验证** - 用户输入必须验证
4. **不要在 useEffect 依赖项中包含不稳定的函数** - 可能导致无限循环

---

## 文件清单

### 新建文件

| 文件路径 | 描述 |
|---------|------|
| `src/components/features/project-editor/project-list.tsx` | 项目列表组件 |
| `src/components/features/project-editor/project-item.tsx` | 项目卡片组件 |
| `src/components/features/project-editor/project-form.tsx` | 项目表单组件 |
| `src/components/features/project-editor/index.ts` | 导出文件 |
| `src/components/features/modules/projects-module-config-dialog.tsx` | 项目配置弹窗 |

### 修改文件

| 文件路径 | 主要变更 |
|---------|---------|
| `prisma/schema.prisma` | 添加 User.projects 字段 |
| `src/types/index.ts` | 添加 Project 接口，修改 User 和 ProjectsModuleData |
| `src/lib/validations.ts` | 添加 projects 验证，修改 projectsModuleDataSchema |
| `src/actions/user-actions.ts` | 添加 updateUserProjects action |
| `src/components/features/modules/projects-module.tsx` | 添加 userProjects prop，支持从 User 数据获取项目 |
| `src/components/features/modules/projects-module-config-dialog.tsx` | 新建项目配置弹窗 |
| `src/components/features/modules/module-edit-dialog.tsx` | 集成项目配置弹窗，bio/projects 模块只显示关闭按钮 |
| `src/app/(dashboard)/dashboard/profile/page.tsx` | 添加项目管理卡片 |
| `src/app/(dashboard)/dashboard/layout-editor/page.tsx` | 加载并传递 userProjects 到 LayoutGrid |
| `src/components/features/layout-editor/layout-grid.tsx` | 添加 userProjects prop 并传递给 ModuleCard |
| `src/components/features/layout-editor/module-card.tsx` | 添加 userProjects prop 并传递给 ProjectsModule |
| `src/components/features/preview/layout-preview.tsx` | 加载并传递 userProjects 到 ModuleLayoutGrid |

### 数据库迁移

| 迁移 ID | 描述 |
|---------|------|
| `20260116121857_add_user_projects` | 添加 User.projects 字段 |

---

## 测试建议

### 功能测试

1. **项目管理**
   - [ ] 添加新项目
   - [ ] 编辑现有项目
   - [ ] 删除项目
   - [ ] 拖拽排序
   - [ ] 表单验证（必填字段、URL 格式等）

2. **项目模块配置**
   - [ ] 打开配置弹窗
   - [ ] 勾选/取消勾选项目
   - [ ] 保存配置
   - [ ] 无项目时的空状态

3. **项目展示**
   - [ ] 在公开页面正确显示
   - [ ] 只显示选中的项目
   - [ ] 图片正确加载
   - [ ] 链接正确跳转

### 边缘情况

- [ ] 无项目时的空状态
- [ ] 删除已选中项目后的处理
- [ ] Legacy 数据兼容性

---

## 后续优化建议

1. **项目图片上传**: 当前只支持图片 URL，可以添加图片上传功能
2. **项目导入/导出**: 支持 JSON 格式批量导入/导出项目
3. **项目模板**: 提供常用项目模板（如 GitHub 仓库、Dribbble 作品等）
4. **项目统计**: 显示项目点击次数等统计信息

---

**文档版本**: 1.1.0
**最后更新**: 2025-01-16

### 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.0.0 | 2025-01-16 | 初始版本 - 项目展示模块基础功能 |
| 1.1.0 | 2025-01-16 | 添加问题 4、5 的修复说明（数据流断裂、UI 优化） |
