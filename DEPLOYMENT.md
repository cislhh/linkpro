# LinkPro 部署指南

本文档详细介绍如何将 LinkPro 项目部署到 Vercel 平台，让你的个人链接页面服务上线运行。

## 目录

1. [前置准备](#前置准备)
2. [数据库配置](#数据库配置)
3. [Vercel 部署](#vercel-部署)
4. [环境变量配置](#环境变量配置)
5. [域名配置（可选）](#域名配置可选)
6. [常见问题](#常见问题)

---

## 前置准备

在开始部署之前，请确保你已经准备好以下内容：

### 必需账号

1. **GitHub 账号** - 用于托管代码仓库
2. **Vercel 账号** - 用于部署应用（可使用 GitHub 账号直接登录）
3. **PostgreSQL 数据库** - 推荐使用以下免费服务之一：
   - [Neon](https://neon.tech) （推荐，免费额度充足）
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)
   - [PlanetScale](https://planetscale.com)

### 本地环境

确保本地已安装：
- Node.js 18+ 
- Git

---

## 数据库配置

### 方案一：使用 Neon（推荐）

1. 访问 [Neon](https://neon.tech) 并注册账号

2. 创建新项目：
   - 点击 "Create a project"
   - 输入项目名称（如 `linkpro`）
   - 选择区域（建议选择离你最近的区域）
   - 点击 "Create project"

3. 获取数据库连接字符串：
   - 在项目 Dashboard 中找到 "Connection string"
   - 复制 **Pooled connection** 字符串，格式如下：
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

4. 保存这个连接字符串，后续配置环境变量时需要使用

### 方案二：使用 Supabase

1. 访问 [Supabase](https://supabase.com) 并注册账号

2. 创建新项目：
   - 点击 "New project"
   - 选择组织
   - 输入项目名称和数据库密码
   - 选择区域
   - 点击 "Create new project"

3. 获取数据库连接字符串：
   - 进入项目设置 → Database
   - 找到 "Connection string" → "URI"
   - 复制连接字符串并替换 `[YOUR-PASSWORD]` 为你设置的密码

---

## Vercel 部署

### 步骤 1：将代码推送到 GitHub

如果你还没有将代码推送到 GitHub：

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/linkpro.git

# 推送代码
git push -u origin main
```

### 步骤 2：在 Vercel 导入项目

1. 访问 [Vercel](https://vercel.com) 并登录（推荐使用 GitHub 账号登录）

2. 点击 "Add New..." → "Project"

3. 在 "Import Git Repository" 中找到你的 `linkpro` 仓库，点击 "Import"

4. 配置项目：
   - **Framework Preset**: 自动检测为 Next.js
   - **Root Directory**: 保持默认（`./`）
   - **Build Command**: 保持默认（`next build`）
   - **Output Directory**: 保持默认

5. **暂时不要点击 Deploy**，先配置环境变量（见下一节）

### 步骤 3：配置环境变量

在 Vercel 项目设置页面，展开 "Environment Variables" 部分，添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | 你的 PostgreSQL 数据库连接字符串 |
| `NEXTAUTH_SECRET` | 随机字符串 | 用于加密会话，可使用 `openssl rand -base64 32` 生成 |
| `NEXTAUTH_URL` | `https://你的域名.vercel.app` | 你的应用 URL（部署后可获得） |

**生成 NEXTAUTH_SECRET 的方法：**

在终端运行：
```bash
openssl rand -base64 32
```

或者访问 https://generate-secret.vercel.app/32 生成

### 步骤 4：部署

1. 配置完环境变量后，点击 "Deploy"

2. 等待部署完成（通常需要 2-5 分钟）

3. 部署成功后，你会获得一个 `.vercel.app` 域名

### 步骤 5：初始化数据库

部署完成后，需要运行数据库迁移来创建表结构：

**方法一：使用 Vercel CLI（推荐）**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 链接项目
vercel link

# 拉取环境变量到本地
vercel env pull .env.local

# 运行数据库迁移
npx prisma migrate deploy
```

**方法二：在 Vercel 项目设置中运行**

1. 进入 Vercel 项目 → Settings → Functions
2. 或者在本地设置好 DATABASE_URL 后运行：
```bash
DATABASE_URL="你的数据库连接字符串" npx prisma migrate deploy
```

### 步骤 6：更新 NEXTAUTH_URL

部署成功后：

1. 复制 Vercel 分配的域名（如 `https://linkpro-xxx.vercel.app`）
2. 进入 Vercel 项目 → Settings → Environment Variables
3. 更新 `NEXTAUTH_URL` 为你的实际域名
4. 重新部署（Settings → Deployments → 点击最新部署的 "..." → Redeploy）

---

## 环境变量配置

### 完整环境变量列表

```env
# 数据库连接（必需）
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# NextAuth 配置（必需）
NEXTAUTH_SECRET="你的随机密钥"
NEXTAUTH_URL="https://你的域名.vercel.app"
```

### 环境变量说明

| 变量 | 必需 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 数据库连接字符串 |
| `NEXTAUTH_SECRET` | ✅ | 用于加密 JWT 和会话的密钥，至少 32 字符 |
| `NEXTAUTH_URL` | ✅ | 应用的完整 URL，包含协议（https://） |

---

## 域名配置（可选）

如果你想使用自定义域名：

### 步骤 1：添加域名

1. 进入 Vercel 项目 → Settings → Domains
2. 输入你的域名（如 `links.example.com`）
3. 点击 "Add"

### 步骤 2：配置 DNS

根据 Vercel 的提示，在你的域名服务商处添加 DNS 记录：

**对于根域名（example.com）：**
- 类型：A
- 名称：@
- 值：76.76.21.21

**对于子域名（links.example.com）：**
- 类型：CNAME
- 名称：links
- 值：cname.vercel-dns.com

### 步骤 3：更新环境变量

域名配置完成后，更新 `NEXTAUTH_URL` 为你的自定义域名：

```
NEXTAUTH_URL=https://你的自定义域名
```

---

## 常见问题

### Q1: 部署失败，提示数据库连接错误

**解决方案：**
1. 检查 `DATABASE_URL` 是否正确
2. 确保数据库服务正在运行
3. 检查数据库是否允许外部连接（Neon/Supabase 默认允许）

### Q2: 登录后跳转到错误页面

**解决方案：**
1. 检查 `NEXTAUTH_URL` 是否与实际访问的 URL 一致
2. 确保 `NEXTAUTH_SECRET` 已正确设置
3. 重新部署应用

### Q3: 页面样式丢失或显示异常

**解决方案：**
1. 清除浏览器缓存
2. 检查 Vercel 构建日志是否有错误
3. 确保所有依赖都已正确安装

### Q4: 数据库迁移失败

**解决方案：**
```bash
# 重置数据库（警告：会删除所有数据）
npx prisma migrate reset

# 或者只部署迁移
npx prisma migrate deploy
```

### Q5: 如何查看应用日志

1. 进入 Vercel 项目 → Deployments
2. 点击最新的部署
3. 查看 "Functions" 标签页中的日志

---

## 部署检查清单

在部署前，请确认以下事项：

- [ ] GitHub 仓库已创建并推送代码
- [ ] PostgreSQL 数据库已创建
- [ ] 已获取数据库连接字符串
- [ ] 已生成 NEXTAUTH_SECRET
- [ ] Vercel 项目已创建
- [ ] 环境变量已配置
- [ ] 数据库迁移已运行
- [ ] NEXTAUTH_URL 已更新为实际域名

---

## 更新部署

当你更新代码后，只需推送到 GitHub，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel 会自动检测到代码变更并触发新的部署。

---

## 技术支持

如果遇到问题，可以：

1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 查看 [Next.js 文档](https://nextjs.org/docs)
3. 查看 [Prisma 文档](https://www.prisma.io/docs)

---

祝你部署顺利！🚀
