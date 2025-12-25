# LinkPro

下一代个人品牌主页生成器，让开发者和创作者能够快速生成拥有高级动效和个性化设计的社交名片。

## 项目简介

LinkPro 是一个现代化的 Link-in-Bio 工具，区别于传统静态页面，强调视觉冲击力和个性化表达。用户可以通过简洁的 Dashboard 管理社交链接，选择精美主题，实时预览效果，并生成独特的个人主页。

## 技术栈

- **框架**: Next.js 16 (App Router + React Server Components)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js (Auth.js v5)
- **验证**: Zod
- **动画**: Framer Motion
- **测试**: Vitest + fast-check (属性测试)

## 核心功能

### 用户认证
- 邮箱注册/登录
- JWT Session 管理
- 路由保护中间件

### 链接管理
- 添加/编辑/删除社交链接
- 拖拽排序
- URL 格式验证

### 主题引擎
- Aurora (极光渐变动效)
- Cyber (霓虹赛博风格)
- Glass (玻璃拟态效果)
- 实时主题切换预览

### 公开页面
- SSR 渲染优化 SEO
- 动态 Open Graph 元数据
- 响应式设计

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证页面 (登录/注册)
│   ├── (dashboard)/       # Dashboard 页面
│   ├── u/[username]/      # 公开个人主页
│   └── api/               # API 路由
├── components/
│   ├── ui/                # shadcn/ui 基础组件
│   ├── features/          # 业务功能组件
│   └── themes/            # 主题组件
├── lib/                   # 工具库
│   ├── db.ts             # Prisma 客户端
│   ├── auth.ts           # NextAuth 配置
│   └── validations.ts    # Zod schemas
├── actions/               # Server Actions
├── stores/                # Zustand stores
├── hooks/                 # 自定义 Hooks
└── types/                 # TypeScript 类型定义
```

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 14+
- pnpm / npm / yarn

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/your-username/linkpro.git
cd linkpro
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/linkpro"
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. 初始化数据库
```bash
npx prisma migrate dev
npx prisma db seed
```

5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 运行测试
npm run test

# 数据库迁移
npx prisma migrate dev

# 重置数据库
npm run db:reset

# 数据库种子
npm run db:seed
```

## 数据模型

### User
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| email | String | 邮箱 (唯一) |
| username | String | 用户名 (唯一) |
| name | String? | 显示名称 |
| bio | String? | 个人简介 |
| theme | String | 主题选择 |

### Link
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| userId | String | 用户 ID |
| title | String | 链接标题 |
| url | String | 链接地址 |
| icon | String? | 图标 |
| order | Int | 排序顺序 |
| isActive | Boolean | 是否启用 |

## 测试

项目采用 Vitest 进行单元测试，fast-check 进行属性测试。

```bash
# 运行所有测试
npm run test

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

## 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 部署

### 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| DATABASE_URL | PostgreSQL 连接字符串 | ✅ |
| AUTH_SECRET | NextAuth 密钥 | ✅ |
| NEXTAUTH_URL | 应用 URL | ✅ |

## 开发规范

### 代码风格
- 使用 ESLint + Prettier 保持代码一致性
- 组件使用 PascalCase 命名
- 工具函数使用 camelCase 命名
- 类型定义集中在 `types/` 目录

### Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

### 分支管理
- `master`: 生产分支
- `develop`: 开发分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支

## License

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request。
