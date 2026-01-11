# 一键部署功能开发文档

## 当前实现状态

### 已完成功能

1. **发布状态管理**
   - `isPublished` 字段：标记页面是否已发布
   - `publishedAt` 字段：记录发布时间戳
   - 草稿/已发布状态显示

2. **Server Actions**
   - `publishPage()`: 发布页面，设置 `isPublished = true`
   - `unpublishPage()`: 取消发布，设置 `isPublished = false`
   - `getPublishStatus()`: 获取发布状态

3. **UI 组件**
   - `PublishButton`: 发布/取消发布按钮，显示公开链接
   - `PublishStatus`: 显示当前发布状态（草稿/已发布）

### 当前问题

1. **公开链接格式固定**: 当前使用 `/u/[username]` 路径格式
2. **不支持自定义域名**: 用户无法设置自己的域名

---

## 自定义域名功能设计

### 功能需求

用户可以设置自己的合法域名，发布后页面通过该域名访问。

### 数据模型变更

在 `User` 模型中添加自定义域名字段：

```prisma
model User {
  // ... 现有字段
  customDomain     String?   @unique  // 用户自定义域名，如 "mypage.example.com"
  domainVerified   Boolean   @default(false)  // 域名是否已验证
  domainVerifiedAt DateTime? // 域名验证时间
}
```

### 域名验证流程

1. **用户输入域名**: 用户在设置页面输入自定义域名
2. **生成验证记录**: 系统生成 TXT 记录值供用户添加到 DNS
3. **DNS 验证**: 系统检查 DNS TXT 记录是否正确
4. **验证成功**: 标记域名已验证，允许发布

### 验证记录格式

```
TXT 记录名称: _linkpro-verify.{用户域名}
TXT 记录值: linkpro-verify={用户ID}
```

### API 设计

#### 1. 设置自定义域名

```typescript
export async function setCustomDomain(domain: string): Promise<ActionResult<{
  domain: string;
  verificationRecord: {
    type: string;
    name: string;
    value: string;
  };
}>>
```

#### 2. 验证域名

```typescript
export async function verifyDomain(): Promise<ActionResult<{
  verified: boolean;
  message: string;
}>>
```

#### 3. 移除自定义域名

```typescript
export async function removeCustomDomain(): Promise<ActionResult<void>>
```

### 路由处理

需要配置 Next.js 支持自定义域名路由：

1. **Middleware 域名检测**: 检测请求域名，匹配用户自定义域名
2. **动态路由重写**: 将自定义域名请求重写到用户页面

### 部署平台配置

#### Vercel 配置

在 `vercel.json` 中配置通配符域名：

```json
{
  "rewrites": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "(?<domain>.*)"
        }
      ],
      "destination": "/api/custom-domain?domain=:domain&path=:path*"
    }
  ]
}
```

---

## 实现计划

### Phase 1: 数据模型更新

- [ ] 添加 `customDomain`、`domainVerified`、`domainVerifiedAt` 字段
- [ ] 执行数据库迁移

### Phase 2: 域名管理 Server Actions

- [ ] 实现 `setCustomDomain` - 设置自定义域名
- [ ] 实现 `verifyDomain` - 验证域名 DNS 记录
- [ ] 实现 `removeCustomDomain` - 移除自定义域名
- [ ] 实现 `getDomainStatus` - 获取域名状态

### Phase 3: 域名验证逻辑

- [ ] 实现 DNS TXT 记录查询
- [ ] 实现验证记录生成
- [ ] 实现验证状态检查

### Phase 4: UI 组件

- [ ] 创建 `DomainSettings` 组件 - 域名设置表单
- [ ] 创建 `DomainVerification` 组件 - 显示验证步骤
- [ ] 更新 `PublishButton` - 显示自定义域名链接

### Phase 5: 路由处理

- [ ] 创建自定义域名路由处理 API
- [ ] 配置 Vercel 域名重写规则
- [ ] 更新公开页面渲染逻辑

---

## 域名验证示例

### 用户操作流程

1. 用户进入"设置 > 自定义域名"
2. 输入域名：`mypage.example.com`
3. 系统显示验证步骤：
   ```
   请在您的 DNS 服务商添加以下 TXT 记录：
   
   记录类型: TXT
   主机记录: _linkpro-verify
   记录值: linkpro-verify=clxxxxxxxxxx
   ```
4. 用户添加 DNS 记录后点击"验证域名"
5. 验证成功后，发布页面将使用自定义域名

### DNS 记录示例

```
_linkpro-verify.mypage.example.com  TXT  "linkpro-verify=clxxxxxxxxxx"
```

---

## 技术实现细节

### DNS 查询实现

使用 Node.js `dns` 模块或第三方 DNS 查询服务：

```typescript
import { promises as dns } from 'dns';

async function verifyDNSRecord(domain: string, expectedValue: string): Promise<boolean> {
  try {
    const records = await dns.resolveTxt(`_linkpro-verify.${domain}`);
    const flatRecords = records.flat();
    return flatRecords.includes(expectedValue);
  } catch (error) {
    return false;
  }
}
```

### 域名格式验证

```typescript
const domainSchema = z.string()
  .min(1, "域名不能为空")
  .regex(
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    "请输入有效的域名格式"
  )
  .refine(
    (domain) => !domain.startsWith('http'),
    "请不要包含 http:// 或 https://"
  );
```

---

## 安全考虑

1. **域名所有权验证**: 必须通过 DNS TXT 记录验证域名所有权
2. **域名唯一性**: 每个域名只能绑定一个用户
3. **防止滥用**: 限制每个用户可绑定的域名数量
4. **SSL 证书**: 自定义域名需要配置 SSL 证书（Vercel 自动处理）

---

## 当前报错问题

如果您遇到报错，请提供具体的错误信息，我将帮助您排查：

1. 发布功能报错？
2. 页面访问报错？
3. 数据库相关报错？

请告诉我具体的错误内容，以便进一步诊断。
