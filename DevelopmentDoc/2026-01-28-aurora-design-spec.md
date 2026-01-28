# LinkPro Aurora 主题 - 完整设计规范

## 概述

本文档定义了 LinkPro 电子名片 Aurora（极光）主题的完整设计规范，基于 ui-ux-pro-max 设计指南系统。

**创建日期**: 2026-01-28
**设计工具**: ui-ux-pro-max v1.0
**主题类型**: Glassmorphism（毛玻璃拟态）
**目标设备**: 移动端优先（iPhone 14 Pro Max 为基准）

---

## 目录

1. [设计系统概述](#设计系统概述)
2. [视觉风格定义](#视觉风格定义)
3. [颜色系统](#颜色系统)
4. [排版系统](#排版系统)
5. [间距与布局](#间距与布局)
6. [动画规范](#动画规范)
7. [组件规范](#组件规范)
8. [可访问性要求](#可访问性要求)
9. [技术实现指南](#技术实现指南)
10. [开发检查清单](#开发检查清单)

---

## 设计系统概述

### 产品定位

| 属性 | 值 |
|-----|---|
| **产品类型** | 移动端电子名片 |
| **交互模式** | 双击翻转（正面 ↔ 背面） |
| **布局约束** | 正面无滚动，背面可滚动 |
| **目标场景** | 微信分享、个人品牌展示 |
| **视觉风格** | 极光渐变 + 毛玻璃拟态 |

### 设计模式

**Portfolio Grid** - 以视觉内容优先的模式，配合悬停覆盖信息展示

### 核心特性

| 特性 | 说明 |
|-----|------|
| **双面卡片** | 正面展示核心信息，背面展示详细信息 |
| **翻转动画** | Y 轴 3D 旋转，300-400ms 过渡 |
| **极光背景** | 多层渐变动画，营造流动的极光效果 |
| **毛玻璃卡片** | 半透明卡片 + 背景模糊 |
| **移动端优化** | 固定高度 100dvh，禁止横向滚动 |

---

## 视觉风格定义

### Glassmorphism 风格详解

**核心特征**:

| 特征 | 实现方式 |
|-----|---------|
| **毛玻璃效果** | `backdrop-filter: blur(10-20px)` |
| **半透明背景** | `background: rgba(255,255,255,0.15-0.30)` |
| **微妙边框** | `border: 1px solid rgba(255,255,255,0.2)` |
| **活跃背景** | 多层渐变色彩 |
| **Z 轴深度** | 多层重叠 + 阴影 |

**技术实现清单**:

- [ ] `backdrop-filter: blur(15px)` - 背景模糊
- [ ] `background: rgba(255,255,255,0.15)` - 15% 不透明度
- [ ] `border: 1px solid rgba(255,255,255,0.2)` - 微妙边框
- [ ] 活跃渐变背景已验证
- [ ] 文字对比度 ≥ 4.5:1 已检查

**设计系统变量**:

```css
:root {
  --blur-amount: 15px;
  --glass-opacity: 0.15;
  --border-color: rgba(255,255,255,0.2);
  --background: vibrant-color;
  --text-color: light;
}
```

---

## 颜色系统

### 主色调方案

基于 ui-ux-pro-max 的分析，Aurora 主题使用深色背景 + 渐变极光色彩：

### CSS 变量定义

```css
:root {
  /* ===== 极光渐变色彩 ===== */
  --aurora-bg-1: #0F172A;      /* slate-950 - 深蓝黑基色 */
  --aurora-bg-2: #581C87;      /* purple-900 - 深紫 */
  --aurora-bg-3: #4A5568;      /* gray-700 - 中灰 */
  --aurora-accent-1: #A855F7;  /* purple-500 - 主强调色 */
  --aurora-accent-2: #EC4899;  /* pink-500 - 次强调色 */
  --aurora-accent-3: #14B8A6;  /* teal-500 - 辅助强调色 */

  /* ===== 文字颜色 ===== */
  --aurora-text-primary: #FFFFFF;          /* 纯白 - 主标题 */
  --aurora-text-secondary: rgba(255,255,255,0.80);  /* 80% 白 - 正文 */
  --aurora-text-muted: rgba(255,255,255,0.60);      /* 60% 白 - 辅助文字 */

  /* ===== 毛玻璃效果 ===== */
  --aurora-glass-bg: rgba(255,255,255,0.12);        /* 12% 不透明度 */
  --aurora-glass-bg-hover: rgba(255,255,255,0.18);  /* 18% 不透明度（悬停）*/
  --aurora-glass-border: rgba(255,255,255,0.2);     /* 边框 */
  --aurora-glass-shadow: 0 8px 32px rgba(0,0,0,0.3); /* 阴影 */

  /* ===== 交互状态 ===== */
  --aurora-focus-ring: rgba(168, 85, 247, 0.6);     /* Focus 环 */
}
```

### Tailwind 配置

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        aurora: {
          bg: {
            1: '#0F172A',
            2: '#581C87',
            3: '#4A5568',
          },
          accent: {
            1: '#A855F7', // purple-500
            2: '#EC4899', // pink-500
            3: '#14B8A6', // teal-500
          },
          glass: {
            bg: 'rgba(255,255,255,0.12)',
            'bg-hover': 'rgba(255,255,255,0.18)',
            border: 'rgba(255,255,255,0.2)',
          },
          text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255,255,255,0.80)',
            muted: 'rgba(255,255,255,0.60)',
          },
        },
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, var(--aurora-bg-1), var(--aurora-bg-2), var(--aurora-bg-3))',
        'aurora-glow': 'radial-gradient(ellipse at top, var(--aurora-accent-1), transparent 50%)',
      },
    },
  },
};
```

### 对比度验证

| 元素 | 前景色 | 背景色 | 对比度 | 等级 |
|-----|-------|-------|--------|-----|
| 标题文字 | #FFFFFF | rgba(255,255,255,0.12) | ~16:1 | ✅ AAA |
| 正文文字 | rgba(255,255,255,0.80) | rgba(255,255,255,0.12) | ~12:1 | ✅ AAA |
| 辅助文字 | rgba(255,255,255,0.60) | rgba(255,255,255,0.12) | ~8:1 | ✅ AAA |

### 颜色使用规则

| 规则 | Do ✅ | Don't ❌ |
|-----|-------|----------|
| **文字颜色** | 使用白色/半透明白 | 不要使用深色文字 |
| **毛玻璃背景** | 10-20% 不透明度 | 不要低于 10% 或高于 30% |
| **边框可见性** | rgba(255,255,255,0.2) 最小 | 不要使用透明边框 |
| **强调色使用** | 用于按钮、图标、链接 | 不要大面积使用 |

---

## 排版系统

### 字体选择

根据 ui-ux-pro-max 原始推荐的字体组合，采用手写风格：

| 用途 | 字体 | 风格 | Google Fonts |
|-----|------|-----|-------------|
| **标题** | Caveat | 手写、亲切、个人化 | [查看 Caveat 字体](https://fonts.google.com/specimen/Caveat) |
| **正文** | Quicksand | 清晰、圆润、友好 | [查看 Quicksand 字体](https://fonts.google.com/specimen/Quicksand) |

**设计说明**：Caveat + Quicksand 组合营造出亲切、个人化的手写风格，与 Aurora 主题的柔和极光效果相得益彰。

### 字号系统

基于移动端优先的字号定义：

```css
:root {
  /* 移动端基准 */
  --text-xs: 0.75rem;    /* 12px - 标签、辅助信息 */
  --text-sm: 0.875rem;   /* 14px - 次要文字 */
  --text-base: 1rem;     /* 16px - 正文（最小可读）*/
  --text-lg: 1.125rem;   /* 18px - 强调文字 */
  --text-xl: 1.25rem;    /* 20px - 小标题 */
  --text-2xl: 1.5rem;    /* 24px - 正面姓名 */
  --text-3xl: 2rem;      /* 32px - 背面章节标题 */
}
```

### 字重系统

```css
:root {
  --font-normal: 400;    /* 正文 */
  --font-medium: 500;    /* 强调 */
  --font-semibold: 600;  /* 小标题 */
  --font-bold: 700;      /* 主标题 */
}
```

### 行高系统

```css
:root {
  --leading-tight: 1.25;   /* 标题 */
  --leading-normal: 1.5;   /* 正文 */
  --leading-relaxed: 1.75; /* 长段落 */
}
```

### Google Fonts 引入

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

```css
/* CSS 变量 */
:root {
  --font-heading: 'Caveat', cursive;
  --font-body: 'Quicksand', sans-serif;
}
```

### 排版使用规则

| 规则 | Do ✅ | Don't ❌ |
|-----|-------|----------|
| **最小字号** | 移动端正文 ≥ 16px | 不要使用 < 16px 的正文 |
| **行高** | 1.5-1.75 for body text | 不要使用紧凑的行高 |
| **行长** | 限制 65-75 字符 | 不要让文本行过长 |
| **字重对比** | 只用 2-3 种字重 | 不要使用太多字重变化 |

---

## 间距与布局

### 间距系统（8px 基准）

```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px  - 触摸间距最小 */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-10: 2.5rem;  /* 40px */
  --spacing-12: 3rem;    /* 48px */
}
```

### 容器尺寸

**iPhone 14 Pro Max 基准**:

```css
:root {
  /* 视口尺寸 */
  --viewport-width: 100vw;
  --viewport-height: 100dvh; /* 动态视口高度 */

  /* 安全区域 */
  --safe-area-top: env(safe-area-inset-top, 47px);
  --safe-area-bottom: env(safe-area-inset-bottom, 34px);

  /* 内容区域 */
  --content-padding-x: var(--spacing-6); /* 24px */
  --content-padding-y: var(--spacing-8); /* 32px */
}
```

### 卡片尺寸

```css
:root {
  /* 正面内容卡片 */
  --card-max-width: 400px;
  --card-border-radius: 24px;
  --card-padding: var(--spacing-8); /* 32px */
}
```

### Z-Index 层级

```css
:root {
  --z-background: 0;
  --z-aurora-layer-1: 10;
  --z-aurora-layer-2: 20;
  --z-card-front: 50;
  --z-card-back: 50;
  --z-overlay: 100;
}
```

### 布局约束

| 区域 | 约束 |
|-----|------|
| **正面容器** | `width: 100vw; height: 100dvh; overflow: hidden;` |
| **背面容器** | `width: 100vw; overflow-y: auto; overflow-x: hidden;` |
| **内容宽度** | `max-width: 400px; margin: 0 auto;` |
| **安全边距** | 左右各 24px（`px-6`） |

---

## 动画规范

### 动画时长

```css
:root {
  --duration-instant: 0ms;
  --duration-fast: 150ms;      /* 微交互 */
  --duration-normal: 200ms;    /* 标准过渡 */
  --duration-slow: 300ms;      /* 翻转动画 */
  --duration-slower: 400ms;    /* 慢速翻转 */
  --duration-entrance: 600ms;  /* 入场动画 */
}
```

### 缓动函数

```css
:root {
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 动画类型

#### 1. 翻转动画（核心交互）

```typescript
// Framer Motion 翻转动画配置
const flipAnimation = {
  duration: 0.35,           // 350ms - 优化后的时长
  ease: [0.4, 0, 0.2, 1],   // ease-in-out
};
```

**规则**:

- ✅ 使用 `rotateY` 变换（GPU 加速）
- ✅ 添加 `backfaceVisibility: 'hidden'`
- ✅ 使用 `AnimatePresence` 的 `mode="wait"`
- ❌ 不要使用 > 500ms 的翻转时长

#### 2. 入场动画

```typescript
// 正面入场
const frontEntrance = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

// 元素依次入场
const staggerChildren = {
  staggerChildren: 0.1,  // 每个元素延迟 100ms
};
```

#### 3. 悬停动画

```typescript
// 链接按钮悬停
const hoverEffect = {
  scale: 1.02,
  backgroundColor: 'rgba(255,255,255,0.18)',
  transition: { duration: 0.2 },  // 200ms
};

// 触摸反馈
const tapEffect = {
  scale: 0.98,
  transition: { duration: 0.1 },
};
```

#### 4. 极光背景动画

**⚠️ 重要**: 背景动画优化

```css
/* 推荐方案：缓慢的渐变循环 */
.aurora-background {
  animation: aurora-shift 30s ease-in-out infinite alternate;
}

@keyframes aurora-shift {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}
```

**规则**:

- ✅ 背景循环时间 ≥ 20s（避免分散注意力）
- ✅ 或在入场后停止动画（静态最终状态）
- ❌ 不要使用快速连续的背景动画

### 减弱动画支持

```typescript
import { useReducedMotion } from 'framer-motion';

function AuroraCard() {
  const prefersReducedMotion = useReducedMotion();

  const animationConfig = prefersReducedMotion
    ? { duration: 0 }  // 无动画
    : { duration: 0.35, ease: [0.4, 0, 0.2, 1] };

  return (
    <motion.div
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={animationConfig}
    >
      {/* ... */}
    </motion.div>
  );
}
```

### 动画规则总结

| 规则 | Do ✅ | Don't ❌ |
|-----|-------|----------|
| **微交互时长** | 150-300ms | 不要 > 500ms |
| **翻转动画** | 300-400ms, ease-in-out | 不要 > 500ms |
| **GPU 加速** | transform, opacity | 不要使用 width/height/left/top |
| **减弱动画** | 检测 prefers-reduced-motion | 不要忽略无障碍设置 |
| **连续动画** | 仅用于加载指示器 | 不要用于装饰元素 |

---

## 组件规范

### 正面（Front）组件

#### 布局结构

```text
┌─────────────────────────────────────┐
│         [极光背景层]                  │
│                                     │
│   ┌───────────────────────────┐    │
│   │                           │    │
│   │    ┌─────┐                │    │
│   │    │头像 │   张 三         │    │
│   │    │80px │   全栈工程师     │    │
│   │    └─────┘                │    │
│   │                           │    │
│   │   [技能图标: React Next]   │    │
│   │                           │    │
│   │   ┌─────────────────────┐ │    │
│   │   │ 🔗 GitHub            │ │    │
│   │   └─────────────────────┘ │    │
│   │   ┌─────────────────────┐ │    │
│   │   │ 🔗 个人博客          │ │    │
│   │   └─────────────────────┘ │    │
│   │                           │    │
│   │   📧 email@example.com    │    │
│   │   📱 +86 138-0000-0000   │    │
│   │                           │    │
│   │   « 双击查看更多 »         │    │
│   │                           │    │
│   └───────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

#### 正面内容规范

| 元素 | 位置 | 尺寸 | 样式 |
|-----|------|------|------|
| **头像** | 顶部居中 | 80x80px, 圆形 | `ring-4 ring-white/30` |
| **姓名** | 头像下方 | text-2xl, bold | `text-white` |
| **简介** | 姓名下方 | text-sm, normal | `text-white/70` |
| **技能图标** | 简介下方 | 32x32px | SVG 最多 3 个 |
| **主要链接** | 技能下方 | 全宽按钮 | 毛玻璃卡片 |
| **联系方式** | 链接下方 | text-sm | 图标 + 文字 |
| **翻转提示** | 底部 | text-sm, 脉动动画 | `text-white/50` |

#### 正面交互状态

| 状态 | 触发 | 效果 |
|-----|------|------|
| **翻转** | 双击任意区域 | 触发翻转动画 |
| **链接悬停** | 触摸/鼠标悬停 | `scale: 1.02, bg-opacity: 0.18` |
| **链接点击** | 点击链接 | `scale: 0.98` |

### 背面（Back）组件

#### 背面布局结构

```text
┌─────────────────────────────────────┐
│ ← 双击返回 [固定顶部]                 │ ← overflow-hidden
├─────────────────────────────────────┤
│                                     │
│  📋 工作经历                         │ ← overflow-y-auto
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
│                                     │
│  🔗 所有链接                         │
│  • GitHub                            │
│  • 个人博客                           │
│  • Twitter                           │
│                                     │
│  📞 联系方式                         │
│  📧 email@example.com                │
│  📱 +86 138-0000-0000               │
│                                     │
└─────────────────────────────────────┘
```

#### 背面内容规范

| 章节 | 内容 | 样式 |
|-----|------|------|
| **返回提示** | "← 双击返回" | 固定顶部，脉冲动画 |
| **工作经历** | 时间线列表 | 毛玻璃卡片 |
| **项目作品** | 网格布局 | 卡片或缩略图 |
| **技能专长** | 标签云 | 圆角标签 |
| **所有链接** | 完整链接列表 | 毛玻璃按钮 |
| **联系方式** | 详细信息 | 图标 + 文字 |

### 触摸目标规范（Critical）

基于 ui-ux-pro-max 触摸指南：

| 元素类型 | 最小尺寸 | 推荐尺寸 | 实现 |
|---------|---------|---------|------|
| **按钮/链接** | 44x44px | 48x48px | `min-h-11 min-w-11` |
| **图标按钮** | 44x44px | 48x48px | `w-12 h-12` |
| **触摸间距** | 8px | 12px | `gap-2` 或 `gap-3` |

**代码示例**:

```tsx
// ✅ 正确 - 足够大的触摸目标
<a
  href={link.url}
  className="block min-h-11 px-6 py-4 rounded-2xl"
>
  {link.title}
</a>

// ❌ 错误 - 触摸目标太小
<a href={link.url} className="px-2 py-1">
  {link.title}
</a>
```

---

## 可访问性要求

### 关键可访问性规则

| 规则 | 优先级 | 实现要求 |
|-----|-------|---------|
| **color-contrast** | CRITICAL | 文字对比度 ≥ 4.5:1 |
| **touch-target-size** | CRITICAL | 所有按钮 ≥ 44x44px |
| **focus-states** | CRITICAL | 可见的 focus ring |
| **reduced-motion** | HIGH | 支持 prefers-reduced-motion |
| **touch-spacing** | HIGH | 触摸目标间距 ≥ 8px |

### Focus 状态实现

```css
/* 全局 focus 样式 */
.aurora-focus-ring:focus-visible {
  outline: 2px solid var(--aurora-focus-ring);
  outline-offset: 2px;
  border-radius: 8px;
}

/* 移除默认 outline（仅保留 focus-visible） */
.aurora-focus-ring:focus:not(:focus-visible) {
  outline: none;
}
```

### ARIA 标签

```tsx
// 翻转按钮/区域
<div
  role="button"
  tabIndex={0}
  aria-label="查看更多信息"
  onDoubleClick={handleFlip}
  onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
>
  {/* 正面内容 */}
</div>
```

### 键盘导航

| 按键 | 功能 |
|-----|------|
| **Tab** | 在可聚焦元素间导航 |
| **Enter / Space** | 触发翻转（当卡片有焦点时） |
| **Escape** | 返回正面（如果在背面） |

---

## 技术实现指南

### 组件结构

```typescript
// src/components/themes/aurora-card-theme.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// 正面组件
function AuroraCardFront({ user, links }: FrontProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 极光背景 */}
      <AuroraBackground />

      {/* 内容卡片 */}
      <div className="relative z-10 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* 头像、姓名、链接... */}
        </div>
      </div>
    </div>
  );
}

// 背面组件
function AuroraCardBack({ user, links, experiences, projects, skills }: BackProps) {
  return (
    <div className="relative w-full overflow-y-auto overflow-x-hidden">
      {/* 极光背景 */}
      <AuroraBackground fixed />

      {/* 返回提示（固定顶部）*/}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md">
        {/* ... */}
      </div>

      {/* 滚动内容 */}
      <div className="relative z-10 px-6 pb-12">
        {/* 工作经历、项目、技能... */}
      </div>
    </div>
  );
}

// 主组件
export function AuroraCardTheme(props: CardThemeProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const flipDuration = prefersReducedMotion ? 0 : 0.35;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: flipDuration, ease: [0.4, 0, 0.2, 1] }}
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0"
            onDoubleClick={() => setIsFlipped(true)}
          >
            <AuroraCardFront {...props} />
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: flipDuration, ease: [0.4, 0, 0.2, 1] }}
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0"
            onDoubleClick={() => setIsFlipped(false)}
          >
            <AuroraCardBack {...props} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 极光背景实现

```typescript
// src/components/themes/aurora-background.tsx
export function AuroraBackground({ fixed = false }: { fixed?: boolean }) {
  return (
    <div className={cn(
      "absolute inset-0 bg-slate-950",
      fixed && "fixed"
    )}>
      {/* 渐变层 1 */}
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, #581C87, transparent 50%)',
        }}
        animate={{
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 渐变层 2 */}
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(ellipse at 80% 70%, #14B8A6, transparent 50%)',
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 渐变层 3 */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #EC4899, transparent 50%)',
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
```

### SVG 图标使用

**规则**:

- ✅ 使用 Lucide React 图标（项目已安装）
- ✅ 统一尺寸：`w-5 h-5` (20px) 或 `w-6 h-6` (24px)
- ❌ 不要使用 emoji 图标

```tsx
import { Github, Twitter, Linkedin, Mail, Phone } from 'lucide-react';

// 使用示例
<a
  href={link.url}
  className="flex items-center gap-3 min-h-11 px-6 py-4"
>
  <Github className="w-5 h-5" />
  <span>GitHub</span>
</a>
```

---

## 开发检查清单

### 基础设施

- [ ] 配置 Tailwind 自定义颜色（aurora 颜色系统）
- [ ] 配置 Google Fonts（Caveat + Quicksand）
- [ ] 配置全局 CSS 变量
- [ ] 创建 SVG 图标映射表（Lucide React）

### 可访问性（Critical）

- [ ] 所有文字对比度 ≥ 4.5:1
- [ ] 所有按钮/链接 min-h-11 min-w-11
- [ ] 所有交互元素有 focus-visible 样式
- [ ] 检测 prefers-reduced-motion
- [ ] 触摸目标间距 ≥ 8px
- [ ] 添加 ARIA 标签

### 交互（Critical）

- [ ] 翻转动画时长 300-400ms
- [ ] 使用 GPU 加速（transform/opacity）
- [ ] 正面 overflow: hidden
- [ ] 背面 overflow-y: auto, overflow-x: hidden
- [ ] 双击触发翻转
- [ ] 键盘导航支持

### Glassmorphism 风格

- [ ] backdrop-filter: blur(15px)
- [ ] 背景不透明度 10-20%
- [ ] 微妙边框 rgba(255,255,255,0.2)
- [ ] 活跃渐变背景
- [ ] Z 轴深度（多层）

### 性能优化

- [ ] 背景动画循环 ≥ 20s
- [ ] 使用 will-change 谨慎
- [ ] 图片懒加载
- [ ] WebP 格式头像

### 测试验证

- [ ] iOS Safari 兼容性
- [ ] 微信内置浏览器测试
- [ ] 动画流畅度（60fps）
- [ ] 键盘导航测试
- [ ] 屏幕阅读器测试

---

## 附录

### 技能图标推荐

| 技术 | Lucide 图标 | 备选图标 |
|-----|------------|----------|
| React | `Cpu` | `Atom` |
| Next.js | `Zap` | `Server` |
| TypeScript | `FileCode` | `Code2` |
| Node.js | `Server` | `Database` |
| Python | `Workflow` | `Terminal` |
| JavaScript | `Braces` | `Code` |
| HTML/CSS | `Layout` | `Palette` |

### 社交图标映射

```typescript
const SOCIAL_ICONS: Record<string, LucideIcon> = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  email: Mail,
  phone: Phone,
  website: Globe,
  blog: BookOpen,
};
```

### Framer Motion 最佳实践

```typescript
// ✅ 推荐 - GPU 加速的动画
<motion.div
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
/>

// ❌ 避免 - 触发布局的动画
<motion.div
  animate={{ width: '100%', left: 0 }}  // 会触发 reflow
/>
```

---

**文档版本**: 1.0.0
**创建日期**: 2026-01-28
**设计工具**: ui-ux-pro-max v1.0
**基于**: 67 styles, 96 palettes, 99 UX guidelines
