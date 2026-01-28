# Aurora 主题双面翻转卡片 - 设计文档

## 概述

本文档定义了 Aurora 主题从单页滚动布局重构为双面翻转卡片交互的完整设计规范。

**创建日期**: 2026-01-28
**设计者**: Claude AI + ui-ux-pro-max
**项目**: LinkPro
**基于**: `DevelopmentDoc/2026-01-28-aurora-design-spec.md`

---

## 目录

1. [架构概述](#架构概述)
2. [数据库与类型定义](#数据库与类型定义)
3. [动画系统](#动画系统)
4. [组件结构](#组件结构)
5. [样式系统](#样式系统)
6. [可访问性](#可访问性)
7. [数据获取](#数据获取)
8. [实现清单](#实现清单)

---

## 架构概述

### 高层架构

Aurora 主题将完全重写，从单页滚动布局转变为双面交互卡片。

### 核心设计决策

1. **组件三分离**:
   - `AuroraCardTheme` - 主容器，管理翻转状态
   - `AuroraCardFront` - 正面，展示核心信息
   - `AuroraCardBack` - 背面，展示详细信息

2. **状态管理**:
   - 使用 React `useState` 管理翻转状态
   - Framer Motion `AnimatePresence` 处理过渡动画

3. **布局约束**:
   - 正面: `h-screen overflow-hidden` (无滚动)
   - 背面: `h-screen overflow-y-auto overflow-x-hidden` (可滚动)

---

## 数据库与类型定义

### Prisma Schema 变更

```prisma
model User {
  // ... 现有字段
  experience    Json?     // 工作经历列表
}
```

### WorkExperience 数据结构

```typescript
interface WorkExperience {
  company: string;       // 公司名称
  position: string;      // 职位
  startDate: string;     // 开始日期 (YYYY-MM)
  endDate?: string;      // 结束日期 (null = 在职)
  description?: string;  // 职位描述
}
```

### TypeScript 类型扩展

```typescript
// src/types/index.ts

// 新增
export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

// 扩展
export interface ThemeProps {
  links: Link[];
  user: Pick<User, 'name' | 'bio' | 'avatarUrl' | 'username' | 'phone' | 'contact'>;
  // 新增
  projects?: Project[];
  skills?: string[];
  experience?: WorkExperience[];
  className?: string;
}

export interface User {
  // ... 现有字段
  experience?: WorkExperience[] | null;
}
```

### 数据库迁移

```bash
npx prisma migrate dev --name add_user_experience
```

---

## 动画系统

### 翻转动画

```typescript
const flipAnimation = {
  duration: 0.35,              // 350ms
  ease: [0.4, 0, 0.2, 1],      // ease-in-out
};
```

### 交互触发方式

| 操作 | 触发方式 | 效果 |
|------|---------|------|
| 正面→背面 | 双击 / Enter | Y轴旋转至180° |
| 背面→正面 | 双击 / Enter / Escape | Y轴旋转回0° |
| 按钮悬停 | 触摸/悬停 | `scale: 1.02` |
| 按钮点击 | 点击 | `scale: 0.98` |

### 极光背景动画

```css
@keyframes aurora-shift {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

.aurora-background {
  animation: aurora-shift 30s ease-in-out infinite alternate;
}
```

### 入场动画

```typescript
const frontEntrance = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerChildren = {
  staggerChildren: 0.1,
};
```

### 减弱动画支持

```typescript
const prefersReducedMotion = useReducedMotion();
const flipDuration = prefersReducedMotion ? 0 : 0.35;
```

---

## 组件结构

### 组件层级

```
AuroraCardTheme (主容器)
├── AuroraBackground
└── AnimatePresence
    ├── AuroraCardFront
    │   ├── AvatarSection
    │   ├── SkillsPreview
    │   ├── MainLinks (最多3个)
    │   ├── ContactPreview
    │   └── FlipHint
    │
    └── AuroraCardBack
        ├── StickyHeader
        ├── ExperienceSection
        ├── ProjectsSection
        ├── SkillsSection
        ├── AllLinksSection
        └── ContactSection
```

### 正面内容规范

| 元素 | 样式 |
|------|------|
| 头像 | 80x80px, 圆形, `ring-4 ring-white/30` |
| 姓名 | text-2xl, bold, 白色 |
| 简介 | text-sm, `text-white/70` |
| 技能图标 | 32x32px, 最多3个 |
| 链接按钮 | 全宽, 毛玻璃卡片 |
| 翻转提示 | text-sm, 脉动动画 |

### 背面内容规范

| 章节 | 内容 |
|------|------|
| 返回提示 | "← 双击返回" 固定顶部 |
| 工作经历 | 时间线列表 |
| 项目作品 | 网格布局卡片 |
| 技能专长 | 标签云 |
| 所有链接 | 完整列表 |
| 联系方式 | 图标+文字 |

---

## 样式系统

### CSS 变量

```css
:root {
  /* 极光渐变色彩 */
  --aurora-bg-1: #0F172A;
  --aurora-bg-2: #581C87;
  --aurora-bg-3: #4A5568;
  --aurora-accent-1: #A855F7;
  --aurora-accent-2: #EC4899;
  --aurora-accent-3: #14B8A6;

  /* 毛玻璃效果 */
  --aurora-glass-bg: rgba(255,255,255,0.12);
  --aurora-glass-bg-hover: rgba(255,255,255,0.18);
  --aurora-glass-border: rgba(255,255,255,0.2);
  --aurora-glass-shadow: 0 8px 32px rgba(0,0,0,0.3);

  /* 字体 */
  --font-heading: 'Caveat', cursive;
  --font-body: 'Quicksand', sans-serif;
}
```

### Google Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 毛玻璃卡片

```css
.aurora-glass-card {
  background: var(--aurora-glass-bg);
  backdrop-filter: blur(15px);
  border: 1px solid var(--aurora-glass-border);
  box-shadow: var(--aurora-glass-shadow);
}
```

---

## 可访问性

### 规则要求

| 规则 | 实现 |
|------|------|
| 触摸目标 | `min-h-11 min-w-11` (44px最小) |
| 文字对比度 | 白色 ≥ 4.5:1 (已验证) |
| Focus 状态 | 可见 focus ring |
| 键盘导航 | Tab/Enter/Escape 支持 |
| 减弱动画 | `prefers-reduced-motion` 检测 |

### Focus Ring

```css
.aurora-focus-ring:focus-visible {
  outline: 2px solid rgba(168, 85, 247, 0.6);
  outline-offset: 2px;
  border-radius: 8px;
}
```

### ARIA 标签

```tsx
<div
  role="button"
  tabIndex={0}
  aria-label={isFlipped ? "返回正面" : "查看更多信息"}
  onDoubleClick={handleFlip}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  }}
>
```

### 响应式约束

| 视口 | 正面 | 背面 |
|------|------|------|
| 移动端 | `w-screen h-screen overflow-hidden` | `w-screen h-screen overflow-y-auto` |
| 桌面端 | `max-w-md mx-auto` | `max-w-md mx-auto` |

---

## 数据获取

### 更新 getUserByUsername

```typescript
// src/app/u/[username]/page.tsx

async function getUserByUsername(username: string): Promise<UserData | null> {
  // ... 获取用户基础信息

  // 新增：获取项目
  const projects = (userData.projects as Project[]) || null;

  // 新增：获取技能
  const skillsModule = await prisma.pageModule.findFirst({
    where: { userId: userData.id, type: 'skills' },
  });
  const skillsData = skillsModule?.data as SkillsModuleData | null;
  const skills = skillsData?.skills || [];

  // 新增：获取工作经历
  const experience = (userData.experience as WorkExperience[]) || null;

  return {
    // ... 现有字段
    projects,
    skills,
    experience,
    links,
  };
}
```

### Zod 验证

```typescript
// src/lib/validations.ts

export const workExperienceSchema = z.object({
  company: z.string().min(1, '公司名称必填'),
  position: z.string().min(1, '职位必填'),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, '日期格式: YYYY-MM'),
  endDate: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  description: z.string().optional(),
});

export const updateProfileWithExperienceSchema = updateProfileSchema.extend({
  experience: z.array(workExperienceSchema).optional(),
});
```

---

## 实现清单

### 需要修改的文件

| 文件 | 变更 |
|------|------|
| `prisma/schema.prisma` | 添加 `experience` 字段 |
| `src/types/index.ts` | 添加 `WorkExperience` 类型，扩展 `ThemeProps` |
| `src/lib/validations.ts` | 添加 `workExperienceSchema` |
| `src/app/u/[username]/page.tsx` | 更新数据获取逻辑 |
| `src/app/globals.css` | 添加 Aurora CSS 变量和动画 |
| `src/app/layout.tsx` | 添加 Google Fonts 链接 |
| `src/components/themes/aurora-theme.tsx` | 完全重写 |

### 需要新建的文件

| 文件 | 说明 |
|------|------|
| `src/components/themes/aurora/card-front.tsx` | 正面组件 |
| `src/components/themes/aurora/card-back.tsx` | 背面组件 |
| `src/components/themes/aurora/background.tsx` | 极光背景 |
| `src/components/themes/aurora/sections/experience.tsx` | 工作经历章节 |
| `src/components/themes/aurora/sections/projects.tsx` | 项目章节 |
| `src/components/themes/aurora/sections/skills.tsx` | 技能章节 |
| `src/components/themes/aurora/sections/contact.tsx` | 联系方式章节 |

### 图标系统 (Lucide React)

```typescript
import {
  Github, Twitter, Linkedin, Mail, Phone,
  Briefcase, Rocket, Lightbulb, ArrowLeft, Globe
} from 'lucide-react';

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  email: Mail,
  phone: Phone,
  website: Globe,
};
```

---

## 技术要点

### 性能优化

- 背景动画循环 ≥ 20s
- 仅使用 `transform` 和 `opacity` (GPU 加速)
- 图片懒加载

### 兼容性

- iOS Safari 测试
- 微信内置浏览器测试
- 动画流畅度 60fps

### 可访问性等级

- WCAG AA 标准
- 对比度 ≥ 4.5:1
- 触摸目标 ≥ 44px

---

**文档版本**: 1.0.0
**创建日期**: 2026-01-28
**状态**: 设计完成，待实现
