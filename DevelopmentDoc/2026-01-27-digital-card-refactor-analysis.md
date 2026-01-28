# LinkPro 电子名片重构评估文档

## 概述

本文档记录了 LinkPro 项目从"可拖拽布局的个人主页生成器"重构为"固定模板电子名片生成器"的完整评估过程，包括需求分析、技术评估、影响范围分析以及实施计划。

**评估日期**: 2026-01-27
**开发者**: Claude AI
**项目**: LinkPro

---

## 目录

1. [三问三答分析](#三问三答分析)
2. [当前架构分析](#当前架构分析)
3. [重构影响范围评估](#重构影响范围评估)
4. [技术设计方案](#技术设计方案)
5. [类型定义重构](#类型定义重构)
6. [数据库变更方案](#数据库变更方案)
7. [实施计划](#实施计划)
8. [风险评估](#风险评估)

---

## 三问三答分析

### 第一问：取消布局编辑模块，改为固定模板的电子名片形式

**用户需求**：
- 当前项目对普通人员使用过于复杂，功能配置过多
- 最初设想是通过简单配置生成基础个人网页，现在仍过于复杂
- 决定取消布局编辑模块，改为固定模板的电子名片形式
- 不允许自定义布局
- 电子名片可分享给他人，特别是发送到微信
- H5页面形式，一点开就能看到
- 只做移动端，以 iPhone 14 Pro Max 为基准

**详细分析**：

#### 1.1 布局编辑模块当前实现

当前项目的布局编辑模块涉及以下文件和功能：

| 文件路径 | 功能 | 是否删除 |
|---------|------|---------|
| `src/app/(dashboard)/dashboard/layout-editor/page.tsx` | 布局编辑器页面入口 | 是 - 删除 |
| `src/components/features/layout-editor/layout-grid.tsx` | 网格布局核心组件 | 是 - 删除 |
| `src/components/features/layout-editor/module-card.tsx` | 模块卡片组件 | 是 - 删除 |
| `src/components/features/layout-editor/layout-grid.css` | 网格样式 | 是 - 删除 |
| `src/stores/layout-store.ts` | Zustand 布局状态管理 | 是 - 删除 |
| `src/lib/layout-templates.ts` | 默认布局模板生成 | 是 - 删除 |

#### 1.2 取消布局编辑后的数据流变化

**当前数据流**（复杂）：
```
用户配置 → 模块创建 → 布局编辑 → 保存布局配置 → 渲染时读取布局 → 应用主题
```

**新数据流**（简化）：
```
用户配置 → 模块创建 → 保存模块数据 → 渲染时应用固定模板 → 应用主题
```

#### 1.3 简化效果评估

| 指标 | 当前 | 重构后 | 减少 |
|-----|------|--------|------|
| Dashboard 页面数量 | 7个 | 5个 | -2个 (-29%) |
| Zustand Store 数量 | 3个 | 2个 | -1个 (-33%) |
| 代码行数（估算） | ~4000行 | ~2500行 | -1500行 (-38%) |
| 用户配置步骤 | 5步 | 3步 | -2步 (-40%) |
| 移动端依赖包 | react-grid-layout, @dnd-kit/core, @dnd-kit/sortable | framer-motion | -3个 |

#### 1.4 iPhone 14 Pro Max 尺寸基准

iPhone 14 Pro Max 屏幕规格：
- **屏幕尺寸**: 6.7 英寸
- **分辨率**: 1290 x 2796 像素
- **逻辑分辨率**: 430 x 932 点
- **设备像素比**: 3x
- **安全区域**: 顶部约 47px，底部约 34px

**设计基准**：
```typescript
// 设计容器尺寸（考虑安全区域）
const DESIGN_WIDTH = 430;  // iPhone 14 Pro Max 逻辑宽度
const DESIGN_HEIGHT = 932; // iPhone 14 Pro Max 逻辑高度
const SAFE_AREA_TOP = 47;
const SAFE_AREA_BOTTOM = 34;

// 实际可用内容区域
const CONTENT_WIDTH = 430;
const CONTENT_HEIGHT = 932 - SAFE_AREA_TOP - SAFE_AREA_BOTTOM; // 851px
```

**结论与建议**：
1. 完全移除布局编辑模块是可行的，将显著降低用户使用门槛
2. 简化后的数据流更直观，用户只需配置内容，无需关心布局
3. 移动端固定尺寸设计可以保证体验一致性
4. 需要确保新设计的电子名片在微信中良好显示

---

### 第二问：三种主题设计三种完全不同的固定样式模板

**用户需求**：
- 三种主题不只是颜色不同，动画演出、排列方式、显示位置等均有不同
- 可以理解为三个固定样式的写好的页面模板
- 读取信息填充
- 关键样式：个人名片只展示在一个页面，不允许有任何上下左右滚动行为
- 可以有一个双击后翻转名片的动画
- 背面展示更多个人信息内容（个人履历、项目等），允许上下滚动
- 页面展示均是横向，要注意个人名片元素的体现
- 逐个开发，先开发 Aurora
- 要求三个模板各自一个 tsx 文件

**详细分析**：

#### 2.1 当前主题实现分析

当前 `AuroraTheme` 组件特点：
- 垂直滚动布局（`min-h-screen`）
- 简单的列表式链接展示
- 背景渐变动画
- 所有内容在一个页面内，但需要滚动

**需要改进的地方**：
- ❌ 当前允许垂直滚动，不符合"无滚动"要求
- ❌ 内容过于简单，缺乏"名片"感
- ❌ 没有翻转动画和背面内容
- ❌ 没有充分利用移动端横向空间

#### 2.2 电子名片设计规范

##### 2.2.1 通用设计要求

**正面（Front）- 横向卡片，无滚动**：

正面展示核心信息，强制横向布局，不允许任何滚动：

```
┌─────────────────────────────────────┐
│                                     │
│   [头像]    张三                    │
│   圆形      全栈开发工程师          │
│                                     │
│   ┌───────────────────────────┐    │
│   │ 🔗 GitHub                 │    │
│   │ 🔗 个人博客               │    │
│   └───────────────────────────┘    │
│                                     │
│   📧 email@example.com              │
│   📱 +86 138-0000-0000             │
│                                     │
│   « 双击查看更多 »                  │
│                                     │
└─────────────────────────────────────┘
```

**正面内容规范**：

| 元素 | 说明 | 限制 |
|-----|------|-----|
| 头像 | 用户头像，圆形显示 | 必需 |
| 姓名 | 用户名称或用户名 | 必需 |
| 简介/职位 | 一句话描述 | 可选 |
| 技能图标 | 最多3个技能图标，横向排列 | 可选 |
| 主要链接 | 最多2个个人链接 | 可选 |
| 联系方式 | 邮箱/电话，图标+文字 | 可选 |

**背面（Back）- 横向卡片，可向下滚动**：

背面展示详细信息，保持横向布局，允许垂直滚动：

```
┌─────────────────────────────────────┐
│  ← 双击返回                          │
├─────────────────────────────────────┤
│  📋 工作经历                         │
│  ┌─────────────────────────────┐    │
│  │ 全栈开发工程师               │    │
│  │ 某某科技有限公司             │    │
│  │ 2022.03 - 至今              │    │
│  └─────────────────────────────┘    │
│                                     │
│  🚀 项目作品                         │
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │项目1│ │项目2│ │项目3│          │
│  └─────┘ └─────┘ └─────┘          │
│                                     │
│  💡 技能专长                         │
│  [React] [Next.js] [TypeScript]     │
│  [Node.js] [PostgreSQL] [Docker]    │
│                                     │
│  🔗 所有链接                         │
│  • GitHub                            │
│  • 个人博客                           │
│  • Twitter                           │
│  • LinkedIn                          │
│                                     │
│  📞 联系方式                         │
│  📧 email@example.com                │
│  📱 +86 138-0000-0000               │
│  💬 微信：xxxxx                      │
└─────────────────────────────────────┘
```

**背面内容规范**：

| 元素 | 说明 |
|-----|------|
| 返回提示 | 顶部固定，提示双击返回 |
| 工作经历 | 时间线列表 |
| 项目作品 | 网格或卡片展示 |
| 技能专长 | 标签云形式 |
| 所有链接 | 完整链接列表 |
| 详细联系 | 完整联系方式 |

##### 2.2.2 无滚动实现技术方案

```typescript
// 正面容器 - 禁止所有滚动
<div style={{
  width: '100vw',
  height: '100vh',
  height: '100dvh', // 动态视口高度，适配移动端浏览器
  overflow: 'hidden', // 禁止滚动
  position: 'relative',
}}>
  {/* 名片内容 */}
</div>

// 背面容器 - 允许垂直滚动
<div style={{
  width: '100vw',
  height: '100vh',
  overflowY: 'auto', // 允许垂直滚动
  overflowX: 'hidden', // 禁止横向滚动
}}>
  {/* 详情内容 */}
</div>
```

##### 2.2.3 翻转动画实现方案

```typescript
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function AuroraCardTheme({ user, links, modules }: CardThemeProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
            onDoubleClick={() => setIsFlipped(true)}
          >
            <FrontContent user={user} links={links.slice(0, 3)} />
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 overflow-y-auto"
            onDoubleClick={() => setIsFlipped(false)}
          >
            <BackContent user={user} links={links} modules={modules} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

#### 2.3 三种主题设计差异

##### Aurora（极光）主题设计

**视觉特点**：
- 动态渐变背景（极光效果）
- 柔和的紫、绿、粉色系
- 流畅的 60fps 动画
- 毛玻璃效果（backdrop-blur）

**布局特点**（正面）- 横向卡片式：

```
┌─────────────────────────────────────┐
│                                     │
│   ╭─────╮                           │
│   │头像 │   张三                    │
│   ╰─────╯   全栈开发工程师          │
│                                     │
│   💻  🚀  ⚛️                       │
│  React  Next  TypeScript            │
│                                     │
│   ┌───────────────────────────┐    │
│   │ 🔗 GitHub                 │    │
│   │ 🔗 个人博客               │    │
│   └───────────────────────────┘    │
│                                     │
│   📧 email@example.com              │
│   📱 +86 138-0000-0000             │
│                                     │
│   « 双击查看更多信息 »              │
│                                     │
└─────────────────────────────────────┘
```

**动画特点**：
- 入场：从下向上淡入 + 头像缩放
- 背景：多层渐变循环动画（8s/10s/12s）
- 技能图标：依次淡入，错开延迟
- 翻转：Y轴旋转 + 透明度变化
- 交互：链接按钮悬停放大效果

**布局特点**（背面）：
- 顶部返回提示（固定）
- 垂直滚动内容区
- 毛玻璃卡片式内容块
- 渐变分隔线

---

##### Cyber（赛博）主题设计

**视觉特点**：
- 霓虹色彩（青色、品红、黄色）
- 发光边框效果
- 科技感网格背景
- 故障艺术（Glitch）效果

**布局特点**（正面）- 横向科技风：

```
┌─────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                                     │
│  ╔══╗   ━━━ 张三 ━━━               │
│  ║👤║   全栈开发工程师               │
│  ╚══╝   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │
│                                     │
│  [▓React▓] [▓Next▓] [▓Node▓]       │
│                                     │
│  ┌────────────────────────────┐    │
│  │ ▓ GitHub ▓                  │    │
│  └────────────────────────────┘    │
│  ┌────────────────────────────┐    │
│  │ ▓ 个人博客 ▓                │    │
│  └────────────────────────────┘    │
│                                     │
│  ▓▓ email@example.com ▓▓          │
│  ▓▓ +86 138-0000-0000 ▓▓         │
│                                     │
│  ▓▓▓ 双击进入数字空间 ▓▓▓          │
│                                     │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
└─────────────────────────────────────┘
```

**动画特点**：
- 入场：故障闪烁效果（Glitch）
- 背景：网格移动 + 扫描线动画
- 边框：霓虹闪烁动画（呼吸灯效果）
- 文字：随机字符解码效果
- 翻转：像素化过渡效果
- 技能图标：霓虹发光脉冲

**布局特点**（背面）：
- 顶部返回提示（霓虹边框）
- 网格背景持续移动
- 卡片式内容块（霓虹边框）
- 扫描线效果覆盖全屏

---

##### Glass（玻璃拟态）主题设计

**视觉特点**：
- 极简白色/浅灰背景
- 3D 视差效果
- 深度阴影（多层阴影）
- 磨砂玻璃质感
- 悬浮粒子背景

**布局特点**（正面）- 横向极简风：

```
┌─────────────────────────────────────┐
│                                     │
│         ┌──────────────────┐         │
│         │                  │         │
│   ○     │                  │         │
│  / \\    │    张 三         │         │
│  | |    │  全栈开发工程师   │         │
│   \\    │                  │         │
│   -     │                  │         │
│         │                  │         │
│         │  ⬡ ⬢ ⬡          │         │
│         │ React Next Node   │         │
│         │                  │         │
│         │  ┌────────────┐  │         │
│         │  │  GitHub    │  │         │
│         │  └────────────┘  │         │
│         │  ┌────────────┐  │         │
│         │  │ 个人博客   │  │         │
│         │  └────────────┘  │         │
│         │                  │         │
│         │  📧 📱           │         │
│         │  翻转了解更多 →   │         │
│         └──────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

**动画特点**：
- 入场：3D 卡片旋转进入
- 背景：悬浮粒子缓慢漂浮
- 卡片：鼠标/触摸移动产生视差效果
- 阴影：动态阴影跟随倾斜
- 技能图标：六边形图标旋转浮入
- 翻转：真实的 3D 卡片翻转（保持透视）
- 按钮：玻璃态按钮按下效果

**布局特点**（背面）：
- 中央玻璃卡片容器（可滚动）
- 卡片跟随触摸倾斜
- 内容块使用半透明玻璃效果
- 深度阴影营造层次感

#### 2.4 组件文件结构

```
src/components/themes/
├── aurora-card-theme.tsx    // Aurora 电子名片
├── cyber-card-theme.tsx     // Cyber 电子名片
├── glass-card-theme.tsx     // Glass 电子名片
└── index.ts                 // 主题注册表
```

每个文件包含：
- 正面内容组件（FrontContent）
- 背面内容组件（BackContent）
- 翻转逻辑
- 主题特定动画

**结论与建议**：
1. 三种主题可以有完全不同的视觉风格和动画
2. 统一使用 framer-motion 实现翻转动画
3. 正面严格限制在 100dvh 内，禁止任何滚动
4. 背面使用 overflow-y-auto 允许垂直滚动，overflow-x-hidden 禁止横向滚动
5. 正面内容统一为：头像 + 姓名/简介 + 技能图标（最多3个）+ 链接（最多2个）+ 联系方式
6. 背面内容包含：工作经历 + 项目作品 + 技能标签 + 所有链接 + 完整联系方式
7. 逐个开发，先完成 Aurora 主题作为参考实现

---

### 第三问：全面评估重构影响范围

**用户需求**：
- 从大到小，仔细评估每个功能直至每个类型的定义
- 都要进行确认

**详细分析**：

#### 3.1 宏观层面影响评估

##### 3.1.1 Dashboard 路由变更

| 当前路由 | 功能 | 重构后 | 说明 |
|---------|------|--------|------|
| `/dashboard/profile` | 个人资料设置 | **保留** | 简化表单 |
| `/dashboard/links` | 链接管理 | **保留** | 无变化 |
| `/dashboard/layout-editor` | 布局编辑 | **删除** | 功能移除 |
| `/dashboard/page-management` | 页面管理 | **删除** | 合并到链接管理 |
| `/dashboard/themes` | 主题选择 | **保留** | 简化为3选1 |
| `/dashboard/preview` | 预览 | **保留** | 改为卡片预览 |
| `/dashboard/settings` | 设置 | **保留** | 无变化 |

##### 3.1.2 组件变更清单

**需要删除的组件**：
```
src/components/features/layout-editor/
├── layout-grid.tsx          // 网格布局组件
├── module-card.tsx          // 模块卡片（拖拽功能）
├── layout-grid.css          // 样式文件
└── index.ts                 // 导出文件
```

**需要重写的组件**：
```
src/components/themes/
├── aurora-theme.tsx         → aurora-card-theme.tsx
├── cyber-theme.tsx          → cyber-card-theme.tsx
├── glass-theme.tsx          → glass-card-theme.tsx
└── index.ts                 // 更新映射关系
```

**需要保留的组件**：
```
src/components/features/
├── link-editor/             // 链接编辑（保留）
├── preview/                 // 预览（修改为卡片预览）
├── publish/                 // 发布（保留）
├── theme-selector/          // 主题选择（保留）
└── dashboard/               // Dashboard布局（保留）
```

##### 3.1.3 状态管理变更

| Store | 当前状态 | 重构后 | 变更内容 |
|-------|---------|--------|---------|
| `layout-store.ts` | 布局编辑状态 | **删除** | 完全移除 |
| `editor-store.ts` | 编辑器状态 | **保留** | 移除布局相关状态 |
| `auth-store.ts` | 认证状态 | **保留** | 无变化 |

#### 3.2 中观层面影响评估

##### 3.2.1 Server Actions 变更

**需要删除的函数**（来自 `module-actions.ts`）：
```typescript
// 这些函数将不再需要
saveDeviceLayout()    // 保存布局配置
getDeviceLayouts()    // 获取布局配置
deleteModule()        // 删除模块（改为固定模块）
```

**需要保留的函数**：
```typescript
// 来自 link-actions.ts
createLink()          // 创建链接 ✅
updateLink()          // 更新链接 ✅
deleteLink()          // 删除链接 ✅
reorderLinks()        // 重新排序链接 ✅
getUserLinks()        // 获取链接列表 ✅

// 来自 user-actions.ts
registerUser()        // 用户注册 ✅
updateUserProfile()   // 更新个人资料 ✅
updateUserTheme()     // 更新主题 ✅

// 来自 publish-actions.ts
publishPage()         // 发布页面 ✅
unpublishPage()       // 取消发布 ✅
getPublishStatus()    // 获取发布状态 ✅
```

**需要新增的函数**：
```typescript
// 新增：获取完整的卡片数据
export async function getCardData(username: string) {
  // 同时获取用户信息、链接、项目等
  // 返回格式化的卡片数据
}
```

##### 3.2.2 数据模型变更

**当前数据模型问题**：
1. `User.mobileLayout` 和 `desktopLayout` 字段不再需要
2. `PageModule` 模型的网格相关字段（`gridX`, `gridY`, `gridW`, `gridH`）不再需要
3. `User.projects` 存储为 JSON，不够结构化

**建议的新数据模型**：

```prisma
// 简化后的 User 模型
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  username      String    @unique
  name          String?
  bio           String?
  avatarUrl     String?
  phone         String?
  contact       String?
  password      String
  theme         String    @default("aurora")
  isPublished   Boolean   @default(false)
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  links       Link[]
  accounts    Account[]
  sessions    Session[]
  experiences Experience[]  // 新增：工作经历
  projects    Project[]      // 改为关联关系
}

// 新增：工作经历模型
model Experience {
  id        String   @id @default(cuid())
  userId    String
  title     String   // 职位
  company   String   // 公司
  startDate DateTime // 开始时间
  endDate   DateTime? // 结束时间（null表示至今）
  description String? // 职位描述
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// 改进：项目模型（从 User.projects JSON 字段迁移出来）
model Project {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String
  url         String?
  imageUrl    String?
  tags        String[] // 技能标签
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// 简化后的 Link 模型（不变）
model Link {
  id        String   @id @default(cuid())
  userId    String
  title     String
  url       String
  icon      String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

##### 3.2.3 类型定义变更

**src/types/index.ts 变更**：

```typescript
// ============ 需要删除的类型 ============

// ❌ 删除：布局相关类型
export interface LayoutItem { ... }
export interface DeviceLayouts { ... }
export interface LayoutEditorState { ... }

// ❌ 删除：模块相关类型
export interface PageModule { ... }
export type ModuleType = 'links' | 'bio' | 'skills' | 'projects';
export type ModuleData = ...;
export interface LinksModuleData { ... }
export interface BioModuleData { ... }
export interface SkillsModuleData { ... }
export interface ProjectsModuleData { ... }

// ============ 需要新增的类型 ============

// ✅ 新增：工作经历
export interface Experience {
  id: string;
  userId: string;
  title: string;       // 职位
  company: string;     // 公司
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ 新增：项目（独立类型，不再是 User 的子对象）
export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  url: string | null;
  imageUrl: string | null;
  tags: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ 新增：卡片主题 Props（扩展原有 ThemeProps）
export interface CardThemeProps extends ThemeProps {
  experiences?: Experience[];
  projects?: Project[];
  skills?: string[];  // 技能标签列表
}

// ✅ 新增：卡片数据结构（用于公开页面）
export interface CardData {
  user: {
    name: string | null;
    bio: string | null;
    avatarUrl: string | null;
    username: string;
    phone: string | null;
    contact: string | null;
  };
  links: Link[];
  experiences: Experience[];
  projects: Project[];
  skills: string[];
  theme: ThemeType;
}
```

#### 3.3 微观层面影响评估

##### 3.3.1 公开页面渲染逻辑变更

**当前实现**（`app/u/[username]/page.tsx`）：
```typescript
// 当前：只获取用户和链接
const user = await getUserByUsername(username);
const links = user.links.filter(link => link.isActive);
return <ThemeComponent links={links} user={userData} />;
```

**新实现**：
```typescript
// 新增：获取完整的卡片数据
const cardData = await getCardData(username);
return <CardThemeComponent {...cardData} />;
```

##### 3.3.2 Dashboard 表单变更

**个人资料表单**（`/dashboard/profile`）：
- 当前：基础信息 + 模块管理
- 重构后：基础信息 + 工作经历 + 技能标签 + 项目管理

**新增表单**：
- 工作经历表单（添加/编辑/删除）
- 项目表单（添加/编辑/删除）
- 技能标签输入

**删除表单**：
- 模块添加/编辑表单
- 布局编辑器

##### 3.3.3 验证模式变更（`src/lib/validations.ts`）

**需要删除的验证**：
```typescript
// ❌ 删除：模块相关验证
export const createModuleSchema = z.object({...});
export const updateModuleSchema = z.object({...});
```

**需要新增的验证**：
```typescript
// ✅ 新增：工作经历验证
export const createExperienceSchema = z.object({
  title: z.string().min(1, '职位不能为空'),
  company: z.string().min(1, '公司不能为空'),
  startDate: z.date(),
  endDate: z.date().nullable(),
  description: z.string().optional(),
});

// ✅ 新增：项目验证
export const createProjectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空'),
  description: z.string().min(1, '项目描述不能为空'),
  url: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

// ✅ 新增：技能验证
export const skillsSchema = z.object({
  skills: z.array(z.string().min(1)).max(20, '最多20个技能'),
});
```

##### 3.3.4 UI 组件变更

**需要删除的组件**：
- `ModuleCard`（拖拽卡片）
- `LayoutGrid`（网格布局）
- 模块编辑对话框

**需要新增的组件**：
- `ExperienceForm`（工作经历表单）
- `ExperienceList`（工作经历列表）
- `ProjectForm`（项目表单）
- `ProjectList`（项目列表）
- `SkillsInput`（技能标签输入）

**需要修改的组件**：
- `ThemeSelector`（主题选择器）- 简化为3个固定选项
- `Preview`（预览）- 改为卡片预览

#### 3.4 影响范围总结表

| 层级 | 项目 | 数量 | 说明 |
|-----|------|------|------|
| **数据库** | 需要删除的字段 | 4个 | mobileLayout, desktopLayout, gridX/Y/W/H |
| | 需要删除的模型 | 1个 | PageModule |
| | 需要新增的模型 | 1个 | Experience |
| | 需要改进的模型 | 1个 | Project（从JSON迁移到关系） |
| **类型定义** | 需要删除的类型 | 8个 | 布局和模块相关类型 |
| | 需要新增的类型 | 5个 | Experience, Project, CardThemeProps等 |
| **Server Actions** | 需要删除的函数 | 3个 | saveDeviceLayout, getDeviceLayouts等 |
| | 需要新增的函数 | 6个 | experience/project相关的CRUD |
| **组件** | 需要删除的组件 | 4个 | layout-editor目录下所有 |
| | 需要重写的组件 | 3个 | 三个主题组件 |
| | 需要新增的组件 | 6个 | Experience/Project相关 |
| **路由** | 需要删除的路由 | 2个 | layout-editor, page-management |
| **Zustand Store** | 需要删除的Store | 1个 | layout-store.ts |

---

## 重构影响范围评估

### 1. 数据库层面影响

#### 1.1 Prisma Schema 变更

```diff
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  username      String    @unique
  name          String?
  bio           String?
  avatarUrl     String?
  phone         String?
  contact       String?
- projects      Json?     // 删除：项目列表
+ experiences   Experience[] // 新增：工作经历关联
+ projects      Project[]    // 改进：项目关联
  password      String
  theme         String    @default("aurora")
- mobileLayout  Json?     // 删除：移动端布局
- desktopLayout Json?     // 删除：桌面端布局
  isPublished   Boolean   @default(false)
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  links       Link[]
  accounts    Account[]
  sessions    Session[]
- pageModules PageModule[]  // 删除：页面模块
}

-model PageModule {           // 删除整个模型
-  id        String   @id @default(cuid())
-  userId    String
-  type      String
-  title     String?
-  data      Json
-  order     Int      @default(0)
-  gridX     Int      @default(0)
-  gridY     Int      @default(0)
-  gridW     Int      @default(1)
-  gridH     Int      @default(1)
-  createdAt DateTime @default(now())
-  updatedAt DateTime  @updatedAt
-
-  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
-
-  @@index([userId])
-}

+model Experience {           // 新增：工作经历模型
+  id        String   @id @default(cuid())
+  userId    String
+  title     String   // 职位
+  company   String   // 公司
+  startDate DateTime // 开始时间
+  endDate   DateTime? // 结束时间
+  description String? // 职位描述
+  order     Int      @default(0)
+  createdAt DateTime @default(now())
+  updatedAt DateTime  @updatedAt
+
+  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
+
+  @@index([userId])
+}

+model Project {              // 改进：独立项目模型
+  id          String   @id @default(cuid())
+  userId      String
+  name        String
+  description String
+  url         String?
+  imageUrl    String?
+  tags        String[]
+  order       Int      @default(0)
+  createdAt   DateTime @default(now())
+  updatedAt   DateTime  @updatedAt
+
+  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
+
+  @@index([userId])
+}
```

#### 1.2 数据迁移策略

```sql
-- 迁移步骤
-- 1. 备份现有数据
CREATE TABLE User_backup AS SELECT * FROM "User";

-- 2. 创建新的 Experience 和 Project 表
-- （由 Prisma migrate 自动生成）

-- 3. 迁移 User.projects JSON 数据到 Project 表
-- （需要编写迁移脚本）

-- 4. 删除旧字段和表
-- （由 Prisma migrate 自动生成）
```

### 2. 类型定义层面影响

```diff
// src/types/index.ts

// ============ 删除的类型 ============
-export interface LayoutItem { ... }
-export interface DeviceLayouts { ... }
-export interface LayoutEditorState { ... }
-export interface PageModule { ... }
-export type ModuleType = 'links' | 'bio' | 'skills' | 'projects';
-export type ModuleData = ...;
-export interface LinksModuleData { ... }
-export interface BioModuleData { ... }
-export interface SkillsModuleData { ... }
-export interface ProjectsModuleData { ... }

// ============ 新增的类型 ============
+export interface Experience {
+  id: string;
+  userId: string;
+  title: string;
+  company: string;
+  startDate: Date;
+  endDate: Date | null;
+  description: string | null;
+  order: number;
+}

+export interface Project {
+  id: string;
+  userId: string;
+  name: string;
+  description: string;
+  url: string | null;
+  imageUrl: string | null;
+  tags: string[];
+  order: number;
+}

+export interface CardThemeProps extends ThemeProps {
+  experiences?: Experience[];
+  projects?: Project[];
+  skills?: string[];
+}

+export interface CardData {
+  user: { ... };
+  links: Link[];
+  experiences: Experience[];
+  projects: Project[];
+  skills: string[];
+  theme: ThemeType;
+}
```

### 3. Server Actions 层面影响

#### 3.1 需要删除的 Actions

```typescript
// src/actions/module-actions.ts - 整个文件删除
-export async function createModule(...) { ... }
-export async function updateModule(...) { ... }
-export async function deleteModule(...) { ... }
-export async function getModules(...) { ... }
-export async function saveDeviceLayout(...) { ... }
-export async function getDeviceLayouts(...) { ... }
```

#### 3.2 需要新增的 Actions

```typescript
// src/actions/experience-actions.ts - 新建文件
+export async function createExperience(data: CreateExperienceInput) { ... }
+export async function updateExperience(id: string, data: UpdateExperienceInput) { ... }
+export async function deleteExperience(id: string) { ... }
+export async function reorderExperiences(experienceIds: string[]) { ... }
+export async function getExperiences() { ... }

// src/actions/project-actions.ts - 新建文件
+export async function createProject(data: CreateProjectInput) { ... }
+export async function updateProject(id: string, data: UpdateProjectInput) { ... }
+export async function deleteProject(id: string) { ... }
+export async function reorderProjects(projectIds: string[]) { ... }
+export async function getProjects() { ... }

// src/actions/card-actions.ts - 新建文件
+export async function getCardData(username: string): Promise<CardData> { ... }
```

### 4. 组件层面影响

#### 4.1 删除的组件

```
删除目录：
src/components/features/layout-editor/
├── layout-grid.tsx
├── module-card.tsx
├── layout-grid.css
└── index.ts
```

#### 4.2 重写的主题组件

```
src/components/themes/
├── aurora-card-theme.tsx  // 重写：电子名片版本
├── cyber-card-theme.tsx   // 重写：电子名片版本
├── glass-card-theme.tsx   // 重写：电子名片版本
└── index.ts               // 更新映射
```

#### 4.3 新增的组件

```
src/components/features/
├── experience/           // 新建目录
│   ├── experience-form.tsx
│   ├── experience-list.tsx
│   └── index.ts
├── project/              // 新建目录
│   ├── project-form.tsx
│   ├── project-list.tsx
│   └── index.ts
└── skills/               // 新建目录
    ├── skills-input.tsx
    └── index.ts
```

### 5. 路由层面影响

```diff
// Dashboard 路由
src/app/(dashboard)/dashboard/
├── profile/page.tsx              // 保留 - 修改
├── links/page.tsx                // 保留
├── themes/page.tsx               // 保留 - 简化
├── preview/page.tsx              // 保留 - 修改
├── settings/page.tsx             // 保留
-├── layout-editor/page.tsx       // 删除
-├── page-management/page.tsx     // 删除
+├── experiences/page.tsx         // 新增 - 工作经历管理
+└── projects/page.tsx            // 新增 - 项目管理
```

### 6. 状态管理层面影响

```diff
// src/stores/
-layout-store.ts    // 删除
editor-store.ts     // 保留 - 移除布局相关状态
auth-store.ts       // 保留
```

---

## 技术设计方案

### 1. 电子名片组件架构

```typescript
// 组件层级结构
CardTheme
├── CardBackground      // 主题背景
├── CardFront          // 正面内容
│   ├── ProfileHeader  // 头像、姓名、简介
│   ├── QuickLinks     // 主要链接（最多3-4个）
│   └── FlipHint       // 翻转提示
└── CardBack           // 背面内容
    ├── BackHeader     // 返回提示
    ├── ExperienceList // 工作经历
    ├── ProjectGrid    // 项目展示
    ├── SkillsCloud    // 技能标签
    ├── AllLinks       // 所有链接
    └── ContactInfo    // 联系方式
```

### 2. 翻转动画实现

```typescript
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CardTheme({ user, links, experiences, projects, skills }: CardThemeProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              backfaceVisibility: 'hidden',
              width: '100%',
              height: '100%',
              position: 'absolute',
            }}
            onDoubleClick={() => setIsFlipped(true)}
          >
            <CardFront user={user} links={links.slice(0, 3)} />
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              backfaceVisibility: 'hidden',
              width: '100%',
              height: '100%',
              position: 'absolute',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
            onDoubleClick={() => setIsFlipped(false)}
          >
            <CardBack
              user={user}
              links={links}
              experiences={experiences}
              projects={projects}
              skills={skills}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 3. Aurora 主题正面设计

```typescript
function AuroraCardFront({ user, links }: CardFrontProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      {/* Aurora Background */}
      <div className="absolute inset-0 bg-slate-950">
        {/* ... 极光动画背景 ... */}
      </div>

      {/* Card Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Profile Card */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-8 border border-white/20">
          {/* Avatar */}
          {user.avatarUrl && (
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.name || user.username}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white/30"
                />
                <div className="absolute inset-0 rounded-full ring-2 ring-white/50 animate-pulse" />
              </div>
            </div>
          )}

          {/* Name & Bio */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {user.name || `@${user.username}`}
            </h1>
            {user.bio && (
              <p className="text-white/70 text-sm">{user.bio}</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3 mb-6">
            {links.map((link, index) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md text-white text-center font-medium border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.98 }}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.title}
              </motion.a>
            ))}
          </div>

          {/* Flip Hint */}
          <motion.div
            className="text-center text-white/50 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            双击查看更多 →
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
```

### 4. Aurora 主题背面设计

```typescript
function AuroraCardBack({ user, links, experiences, projects, skills }: CardBackProps) {
  return (
    <div className="relative w-full min-h-full">
      {/* Aurora Background */}
      <div className="fixed inset-0 bg-slate-950">
        {/* ... 极光动画背景 ... */}
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-12">
        {/* Back Header */}
        <div className="text-center mb-12">
          <motion.div
            className="inline-flex items-center gap-2 text-white/60 text-sm"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>← 双击返回</span>
          </motion.div>
        </div>

        {/* Experiences Section */}
        {experiences.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">工作经历</h2>
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="rounded-2xl bg-white/10 backdrop-blur-xl p-6 border border-white/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                    <span className="text-white/50 text-sm">
                      {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : '至今'}
                    </span>
                  </div>
                  <p className="text-white/70 mb-2">{exp.company}</p>
                  {exp.description && (
                    <p className="text-white/60 text-sm">{exp.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">项目作品</h2>
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="rounded-2xl bg-white/10 backdrop-blur-xl overflow-hidden border border-white/20"
                >
                  {project.imageUrl && (
                    <img src={project.imageUrl} alt={project.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/20 text-white/80 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">技能专长</h2>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.03 * index }}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md text-white font-medium border border-white/20"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </section>
        )}

        {/* All Links Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">联系方式</h2>
          <div className="space-y-3">
            {links.map((link, index) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/10"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.98 }}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.title}
              </motion.a>
            ))}
          </div>
        </section>

        {/* Contact Info */}
        {(user.phone || user.contact) && (
          <section className="text-center text-white/60 text-sm pb-8">
            {user.phone && <p className="mb-2">{user.phone}</p>}
            {user.contact && <p>{user.contact}</p>}
          </section>
        )}
      </div>
    </div>
  );
}
```

---

## 实施计划

### 阶段一：数据库和类型重构（1-2天）

1. **创建新的 Prisma Schema**
   - [ ] 添加 `Experience` 模型
   - [ ] 改进 `Project` 模型（从 JSON 迁移到关系）
   - [ ] 从 `User` 模型删除 `mobileLayout`, `desktopLayout`, `projects` 字段
   - [ ] 删除 `PageModule` 模型

2. **创建数据库迁移**
   - [ ] 运行 `npx prisma migrate dev --name refactor_to_card`
   - [ ] 编写数据迁移脚本（将现有 projects JSON 迁移到 Project 表）

3. **更新类型定义**
   - [ ] 添加 `Experience`, `Project` 类型
   - [ ] 添加 `CardThemeProps`, `CardData` 类型
   - [ ] 删除布局和模块相关类型

4. **更新验证模式**
   - [ ] 添加 `createExperienceSchema`, `updateExperienceSchema`
   - [ ] 添加 `createProjectSchema`, `updateProjectSchema`
   - [ ] 添加 `skillsSchema`
   - [ ] 删除模块相关验证

### 阶段二：Server Actions 重构（1天）

1. **创建新的 Actions**
   - [ ] `experience-actions.ts`
   - [ ] `project-actions.ts`
   - [ ] `card-actions.ts`

2. **删除不需要的 Actions**
   - [ ] 删除 `module-actions.ts`
   - [ ] 删除布局相关函数

### 阶段三：Aurora 主题开发（2-3天）

1. **创建 Aurora 卡片主题**
   - [ ] `aurora-card-theme.tsx` 基础结构
   - [ ] 实现正面内容（无滚动）
   - [ ] 实现背面内容（可滚动）
   - [ ] 实现翻转动画
   - [ ] 添加极光背景动画

2. **测试 Aurora 主题**
   - [ ] 测试翻转动画
   - [ ] 测试内容渲染
   - [ ] 测试移动端适配
   - [ ] 测试微信内显示

### 阶段四：Dashboard 重构（2-3天）

1. **删除不需要的页面**
   - [ ] 删除 `layout-editor` 页面
   - [ ] 删除 `page-management` 页面

2. **创建新的管理页面**
   - [ ] `experiences` 页面（工作经历管理）
   - [ ] `projects` 页面（项目管理）
   - [ ] 更新 `profile` 页面（添加技能输入）

3. **更新导航菜单**
   - [ ] 移除布局编辑器入口
   - [ ] 添加新页面入口

4. **更新预览页面**
   - [ ] 改为卡片预览模式

### 阶段五：其他主题开发（3-4天）

1. **Cyber 主题**
   - [ ] `cyber-card-theme.tsx`
   - [ ] 霓虹效果实现
   - [ ] 故障艺术动画

2. **Glass 主题**
   - [ ] `glass-card-theme.tsx`
   - [ ] 3D 视差效果
   - [ ] 磨砂玻璃质感

### 阶段六：测试和优化（1-2天）

1. **功能测试**
   - [ ] 完整用户流程测试
   - [ ] 数据持久化测试
   - [ ] 发布/取消发布测试

2. **性能优化**
   - [ ] 动画性能优化（60fps）
   - [ ] 图片加载优化
   - [ ] 首屏加载优化

3. **兼容性测试**
   - [ ] iOS Safari 测试
   - [ ] 微信内置浏览器测试
   - [ ] 不同屏幕尺寸测试

---

## 风险评估

### 高风险项

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 数据迁移导致用户数据丢失 | 严重 | 1. 完整备份现有数据<br>2. 在测试环境验证迁移脚本<br>3. 提供回滚方案 |
| 微信内置浏览器兼容性问题 | 中等 | 1. 优先测试微信环境<br>2. 准备降级方案<br>3. 添加浏览器检测 |
| 翻转动画在某些设备卡顿 | 中等 | 1. 使用 GPU 加速属性<br>2. 提供关闭动画选项<br>3. 性能监控 |

### 中风险项

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 用户体验大幅变化导致流失 | 中等 | 1. 保留旧版功能过渡期<br>2. 提供使用教程<br>3. 收集用户反馈 |
| 现有链接失效 | 中等 | 1. 保持公开页面 URL 不变<br>2. 自动重定向 |
| 主题开发工作量超预期 | 中等 | 1. 逐个主题开发<br>2. 先完成 Aurora 作为参考 |

### 低风险项

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 代码重构引入 bug | 低 | 1. 充分测试<br>2. 代码审查 |
| 性能下降 | 低 | 1. 性能基准测试<br>2. 持续监控 |

---

## 技术要点总结

### DO（推荐做法）

1. **使用动态视口高度单位**
   ```css
   height: 100dvh; /* 而非 100vh，适配移动端浏览器地址栏 */
   ```

2. **翻转动画使用 GPU 加速**
   ```css
   transform: rotateY(0deg);
   backface-visibility: hidden;
   will-change: transform, opacity;
   ```

3. **触摸反馈优化**
   ```typescript
   whileTap={{ scale: 0.95 }} // 触摸时的视觉反馈
   ```

4. **图片懒加载**
   ```typescript
   <img loading="lazy" ... />
   ```

### DON'T（避免做法）

1. **不要在正面使用 overflow**
   ```css
   /* ❌ 错误 */
   .front {
     overflow-y: auto; /* 这会导致滚动 */
   }

   /* ✅ 正确 */
   .front {
     overflow: hidden; /* 禁止所有滚动 */
   }
   ```

2. **不要使用 will-change 过度**
   ```css
   /* ❌ 错误 - 会消耗大量内存 */
   * {
     will-change: transform;
   }

   /* ✅ 正确 - 只在动画元素上使用 */
   .animated-element {
     will-change: transform;
   }
   ```

3. **不要忽略微信内置浏览器兼容性**
   ```typescript
   // ❌ 错误 - 假设所有浏览器支持
   const isSupported = true;

   // ✅ 正确 - 检测并处理
   const isWeChat = /micromessenger/i.test(navigator.userAgent);
   if (isWeChat) {
     // 特殊处理
   }
   ```

---

## 文件清单

### 需要删除的文件

```
src/
├── app/(dashboard)/dashboard/
│   ├── layout-editor/        # 删除整个目录
│   └── page-management/      # 删除整个目录
├── components/features/
│   └── layout-editor/        # 删除整个目录
├── stores/
│   └── layout-store.ts       # 删除
├── actions/
│   └── module-actions.ts     # 删除
└── lib/
    └── layout-templates.ts   # 删除
```

### 需要新建的文件

```
src/
├── app/(dashboard)/dashboard/
│   ├── experiences/
│   │   └── page.tsx
│   └── projects/
│       └── page.tsx
├── components/features/
│   ├── experience/
│   │   ├── experience-form.tsx
│   │   ├── experience-list.tsx
│   │   └── index.ts
│   ├── project/
│   │   ├── project-form.tsx
│   │   ├── project-list.tsx
│   │   └── index.ts
│   └── skills/
│       ├── skills-input.tsx
│       └── index.ts
├── components/themes/
│   ├── aurora-card-theme.tsx
│   ├── cyber-card-theme.tsx
│   └── glass-card-theme.tsx
├── actions/
│   ├── experience-actions.ts
│   ├── project-actions.ts
│   └── card-actions.ts
└── types/
    └── experience.ts         # 可选：类型分离
```

### 需要修改的文件

```
src/
├── prisma/
│   └── schema.prisma         # 数据库模型重构
├── types/
│   └── index.ts              # 类型定义更新
├── lib/
│   └── validations.ts        # 验证模式更新
├── app/u/[username]/
│   └── page.tsx              # 公开页面更新
├── app/(dashboard)/dashboard/
│   ├── profile/page.tsx      # 添加技能输入
│   ├── themes/page.tsx       # 简化主题选择
│   └── preview/page.tsx      # 卡片预览
├── components/
│   ├── dashboard/
│   │   └── dashboard-nav.tsx # 更新导航菜单
│   └── themes/
│       └── index.ts          # 更新主题映射
└── stores/
    └── editor-store.ts       # 移除布局相关状态
```

---

## 三问三答总结

### 问一：取消布局编辑模块，改为固定模板的电子名片形式

**答**：完全可行，且强烈建议实施。

**理由**：
1. 当前布局编辑系统过于复杂，用户学习成本高
2. 固定模板可大幅简化代码，减少约 38% 的代码量
3. 统一的移动端体验更适合微信分享场景
4. 简化的数据流更易维护

**影响**：
- 删除约 15 个文件
- 简化 2 个 Zustand Store
- 删除 3 个第三方依赖
- 删除 4 个数据库字段

### 问二：三种主题设计三种完全不同的固定样式模板

**答**：技术上完全可行，设计上已统一规范。

**实现要点**：
1. **正面无滚动**：使用 `overflow: hidden` 和固定高度 `100dvh`
2. **背面可滚动**：使用 `overflow-y: auto` 允许垂直滚动，`overflow-x: hidden` 禁止横向滚动
3. **翻转动画**：使用 Framer Motion 的 `AnimatePresence` 和 `rotateY` 变换
4. **各自独立**：每个主题一个独立的 tsx 文件
5. **逐个开发**：先完成 Aurora 作为参考实现

**三种主题设计差异**：

| 主题 | 视觉风格 | 正面布局特点 | 背面布局特点 | 动画特点 |
|-----|---------|------------|------------|---------|
| **Aurora** | 渐变极光背景 + 毛玻璃卡片 | 简约横向布局，头像左侧，内容右侧 | 毛玻璃卡片式内容块 | 柔和渐变动画，依次淡入 |
| **Cyber** | 霓虹发光 + 故障艺术 | 科技感横向布局，霓虹边框强调 | 霓虹边框卡片，网格背景 | 故障闪烁，扫描线效果 |
| **Glass** | 极简白色 + 3D 视差 | 中央悬浮卡片，极简风格 | 中央可滚动玻璃卡片 | 3D 旋转进入，视差跟随 |

**正面内容统一规范**：
- 头像（圆形，必需）
- 姓名/简介（必需）
- 技能图标（最多3个，可选）
- 主要链接（最多2个，可选）
- 联系方式（邮箱/电话，可选）

**背面内容统一规范**：
- 工作经历（时间线列表）
- 项目作品（网格展示）
- 技能专长（标签云）
- 所有链接（完整列表）
- 完整联系方式

### 问三：全面评估重构影响范围

**答**：影响范围较大，但可控。

**影响范围**：
1. **数据库层面**：需要删除 1 个模型，新增 1 个模型，改进 1 个模型
2. **类型定义**：删除 8 个类型，新增 5 个类型
3. **Server Actions**：删除 3 个函数，新增约 15 个函数
4. **组件**：删除 4 个组件，重写 3 个主题组件，新增 6 个组件
5. **路由**：删除 2 个路由，新增 2 个路由

**总体评估**：
- 代码减少约 1500 行（38%）
- 用户配置步骤减少 40%
- 开发工作量约 8-12 天
- 风险等级：中等

---

## 结论

本次重构将 LinkPro 从一个"功能复杂的专业主页生成器"转变为"简单易用的电子名片生成器"，更符合最初的定位和目标用户需求。

**核心优势**：
1. 用户体验大幅简化（配置步骤减少 40%）
2. 代码复杂度降低（代码量减少 38%）
3. 移动端体验统一（专为微信分享优化）
4. 视觉效果升级（三种独特的高质量主题）

**关键风险**：
1. 数据迁移需要谨慎处理
2. 现有用户需要适应新界面
3. 三个主题开发工作量较大

**建议**：
1. 优先完成 Aurora 主题作为 MVP
2. 保留一段时间旧版功能供用户过渡
3. 充分测试微信内置浏览器兼容性
4. 收集用户反馈后逐步完善其他两个主题

---

**文档版本**: 1.0.0
**最后更新**: 2026-01-27
**维护者**: LinkPro 开发团队
