# 数据库与 Prisma 模型问题报告

**审查日期**: 2026-01-17
**审查范围**: Prisma Schema 和数据库相关代码

---

## 问题列表

### 1. User 模型中 theme 字段默认值与类型定义不匹配

**文件**: `prisma/schema.prisma`, `src/types/index.ts`
**行号**: `schema.prisma:25`, `types/index.ts:16,29`

**问题描述**:
Prisma schema 中 `theme` 字段类型是 `String`，但 TypeScript 类型定义为字面量联合类型。

**当前代码**:
```prisma
// prisma/schema.prisma
model User {
  // ...
  theme  String  @default("aurora")
  // ...
}
```

```typescript
// src/types/index.ts
export type ThemeType = 'aurora' | 'cyber' | 'glass';

export interface User {
  // ...
  theme: ThemeType;
  // ...
}
```

**问题分析**:
- Prisma 生成的类型是 `string`，而不是 `'aurora' | 'cyber' | 'glass'`
- 需要在运行时验证 theme 值的有效性
- 如果数据库中存储了无效值，TypeScript 不会捕获

**修改建议**:
使用 Prisma 的枚举类型，或在应用层添加验证

**修改思路**:
```prisma
// 方案1: 使用 Prisma 枚举（推荐）
enum Theme {
  aurora
  cyber
  glass
}

model User {
  // ...
  theme  Theme  @default(aurora)
  // ...
}
```

```typescript
// 方案2: 保持 Prisma String，在应用层验证
// 从数据库读取后验证
const user = await prisma.user.findUnique({ ... });
if (user && !['aurora', 'cyber', 'glass'].includes(user.theme)) {
  // 处理无效值
}
```

---

### 2. PageModule 的 type 字段缺少数据库约束

**文件**: `prisma/schema.prisma`
**行号**: 96

**问题描述**:
`type` 字段是普通的 `String`，没有枚举约束。

**当前代码**:
```prisma
model PageModule {
  // ...
  type  String   // 'links' | 'bio' | 'skills' | 'projects'
  // ...
}
```

**问题分析**:
- 数据库层面无法约束 type 的有效值
- 可能插入无效的模块类型
- 需要在应用层验证

**修改建议**:
使用 Prisma 枚举

**修改思路**:
```prisma
enum ModuleType {
  links
  bio
  skills
  projects
}

model PageModule {
  // ...
  type  ModuleType
  // ...
}
```

---

### 3. 缺少数据库索引优化查询性能

**文件**: `prisma/schema.prisma`
**行号**: 全文

**问题描述**:
一些常用于查询和排序的字段缺少索引。

**问题分析**:
- `Link.order` 用于排序但无索引
- `PageModule.order` 用于排序但无索引
- `User.username` 虽然有唯一约束但可能需要复合索引
- `Link.isActive` 常用于过滤

**修改建议**:
添加必要的索引

**修改思路**:
```prisma
model Link {
  // ...
  isActive  Boolean  @default(true)
  order     Int      @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, order])  // 复合索引：按用户和顺序查询
  @@index([isActive])        // 活跃链接查询
}

model PageModule {
  // ...
  order     Int      @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, order])  // 复合索引：按用户和顺序查询
  @@index([type])           // 按类型查询
}
```

---

### 4. 缺少外键级联删除的文档说明

**文件**: `prisma/schema.prisma`
**行号**: 52, 71, 82, 108

**问题描述**:
虽然使用了 `onDelete: Cascade`，但没有文档说明级联删除的行为。

**当前代码**:
```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```

**问题分析**:
- 删除用户时，所有关联数据会被自动删除
- 开发者可能不了解这一行为
- 可能导致意外数据丢失

**修改建议**:
在 schema 或文档中添加注释说明

**修改思路**:
```prisma
// 用户删除时会级联删除所有关联数据：
// - Link (社交链接)
// - PageModule (页面模块)
// - Account (第三方账户)
// - Session (会话)
model Link {
  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade  // 删除用户时自动删除关联链接
  )

  @@index([userId])
}
```

---

### 5. Json 字段缺少数据库层面的验证

**文件**: `prisma/schema.prisma`
**行号**: 23, 27, 28, 98

**问题描述**:
`User.projects`、`User.mobileLayout`、`User.desktopLayout`、`PageModule.data` 都是 Json 字段，没有结构验证。

**问题分析**:
- 数据库层面无法验证 JSON 结构
- 可能存储无效或不完整的数据
- 应用层必须验证所有 JSON 数据

**修改建议**:
在应用层添加严格的 Zod 验证

**修改思路**:
```typescript
// 在读取 JSON 字段后立即验证
const user = await prisma.user.findUnique({
  where: { id },
  select: { projects: true, mobileLayout: true, desktopLayout: true },
});

// 验证 projects
if (user?.projects) {
  const result = z.array(projectSchema).safeParse(user.projects);
  if (!result.success) {
    // 记录错误并返回默认值
    console.error('Invalid projects data:', result.error);
    user.projects = [];
  }
}

// 验证 mobileLayout
if (user?.mobileLayout) {
  const result = deviceLayoutSchema.safeParse(user.mobileLayout);
  if (!result.success) {
    console.error('Invalid mobileLayout:', result.error);
    user.mobileLayout = null;
  }
}
```

---

### 6. 缺少数据库迁移版本控制

**文件**: `prisma/migrations/`

**问题描述**:
项目使用 Prisma Migrate，但缺少迁移命名规范和版本控制策略。

**问题分析**:
- 迁移文件命名不一致（如日期 vs 序号）
- 缺少回滚策略文档
- 生产环境迁移风险

**修改建议**:
制定迁移命名规范和流程

**修改思路**:
```bash
# 迁移命名规范
# <version>_<description>_<author>_<timestamp>

# 示例
20250117000001_add_theme_enum.claude
20250117000002_add_module_indexes.claude
20250117000003_add_user_constraints.claude

# 迁移前 checklist
1. 备份数据库
2. 在开发环境测试迁移
3. 准备回滚脚本
4. 在低峰期执行迁移
```

---

### 7. 缺少软删除支持

**文件**: `prisma/schema.prisma`

**问题描述**:
删除操作是硬删除，数据无法恢复。

**问题分析**:
- 用户误删除后无法恢复
- 审计日志缺失
- 无法分析删除趋势

**修改建议**:
考虑添加软删除支持

**修改思路**:
```prisma
// 对于需要软删除的模型
model Link {
  id        String   @id @default(cuid())
  // ...
  deletedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([deletedAt])  // 软删除索引
}

// 查询时过滤已删除项
const links = await prisma.link.findMany({
  where: {
    deletedAt: null,  // 只查询未删除的
  },
});
```

---

## 严重程度评级

| 问题 | 严重程度 | 影响范围 |
|-----|---------|---------|
| theme 类型不匹配 | 中 | 类型安全 |
| type 字段约束 | 中 | 数据完整性 |
| 缺少索引 | 中 | 查询性能 |
| 级联删除文档 | 低 | 开发体验 |
| Json 验证 | 中 | 数据完整性 |
| 迁移控制 | 低 | 运维安全 |
| 软删除 | 低 | 数据恢复 |

---

## 建议修复优先级

1. **高优先级**: 问题 #2 (type 字段约束) - 数据完整性
2. **中优先级**: 问题 #1 (theme 类型) - 类型安全
3. **中优先级**: 问题 #3 (缺少索引) - 查询性能
4. **中优先级**: 问题 #5 (Json 验证) - 数据完整性
5. **低优先级**: 问题 #4、#6、#7 - 文档和功能增强

---

## 相关文件清单

- `prisma/schema.prisma`
- `src/types/index.ts`
- `src/lib/validations.ts`
- `src/actions/user-actions.ts`
- `src/actions/module-actions.ts`
