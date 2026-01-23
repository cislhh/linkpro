# Agent Skills 插件使用指南

## 一、插件简介

Agent Skills 是 Anthropic 官方的 Claude 技能插件，包含 **16 个预装技能**，可将 Claude 从通用助手转变为专业领域专家。

### 两个插件包

| 插件包 | 包含技能 | 用途 |
|--------|---------|------|
| **document-skills** | docx, pdf, pptx, xlsx | 文档处理 |
| **example-skills** | 其余 12 个技能 | 创意、开发、企业协作 |

---

## 二、安装方式

### 在 Claude Code 中安装

```bash
# 添加插件市场
/plugin marketplace add anthropics/skills

# 安装文档技能
/plugin install document-skills@anthropic-agent-skills

# 安装示例技能
/plugin install example-skills@anthropic-agent-skills
```

### 在 Claude.ai 中使用

付费用户已经内置所有技能，直接使用即可。

---

## 三、正确使用方法

### 核心原则：**明确提及/指定要使用的技能**

> 根据官方 README："After installing the plugin, you can use the skill by **just mentioning it**."

```
✅ 正确做法：
"使用 pptx 技能帮我创建一个关于季度报告的 PowerPoint 演示"
"使用 PDF 技能填写这个表单"
"使用 xlsx 技能分析这个 Excel 表格中的销售数据"
"Use the PDF skill to extract the form fields from file.pdf"

❌ 错误做法：
"帮我创建一个 PowerPoint 演示"（未指定技能，Claude 不知道使用 pptx）
"分析这个表格"（未指定技能，Claude 不知道使用 xlsx）
```

**关键：必须明确提及技能名称**，如 "pptx 技能"、"PDF skill"、"docx" 等。

---

## 四、使用场景示例

### 文档处理

| 正确的请求格式 | 示例 |
|-------------|------|
| 提及技能 + 任务 | "使用 **docx 技能**创建一个专业的 Word 合同文档" |
| | "使用 **PDF 技能**填写这个申请表" |
| | "使用 **pptx 技能**基于这个模板生成演示文稿" |
| | "使用 **xlsx 技能**创建一个财务模型 Excel 表格" |

### 设计创作

| 正确的请求格式 | 示例 |
|-------------|------|
| 提及技能 + 任务 | "使用 **frontend-design 技能**设计一个公司官网首页" |
| | "使用 **canvas-design 技能**创建一个艺术海报" |
| | "使用 **algorithmic-art 技能**生成一个流动的粒子艺术" |
| | "使用 **theme-factory 技能**为幻灯片应用主题" |
| | "使用 **slack-gif-creator 技能**制作一个 Slack 表情 GIF" |

### 开发任务

| 正确的请求格式 | 示例 |
|-------------|------|
| 提及技能 + 任务 | "使用 **mcp-builder 技能**构建一个 MCP 服务器连接 GitHub API" |
| | "使用 **skill-creator 技能**创建自定义技能" |
| | "使用 **webapp-testing 技能**测试本地 Web 应用" |
| | "使用 **web-artifacts-builder 技能**创建 React 工件" |

### 企业协作

| 正确的请求格式 | 示例 |
|-------------|------|
| 提及技能 + 任务 | "使用 **doc-coauthoring 技能**写一个技术规范文档" |
| | "使用 **internal-comms 技能**写一份周进度报告" |

---

## 五、技能工作原理

### 触发机制

```
1. 你发送请求（提及技能名称）
       ↓
2. Claude 检测到技能名称
       ↓
3. 加载该技能的完整指令
       ↓
4. 按照技能指令执行任务
```

### 关键点

- **必须提及技能名称**：如 "使用 docx 技能"、"Use the PDF skill"
- **按需加载**：只有指定技能时才加载完整指令（节省上下文）
- **可组合使用**：可以在同一任务中使用多个技能

### 技能名称参考

| 类别 | 技能名称 | 英文名称 |
|------|---------|---------|
| 文档 | docx | docx |
| | PDF | pdf |
| | PowerPoint / pptx | pptx |
| | Excel / xlsx | xlsx |
| 设计 | 前端设计 | frontend-design |
| | 画布设计 | canvas-design |
| | 算法艺术 | algorithmic-art |
| | 品牌指南 | brand-guidelines |
| | 主题工厂 | theme-factory |
| | Slack GIF | slack-gif-creator |
| 开发 | MCP 构建器 | mcp-builder |
| | 技能创建器 | skill-creator |
| | Web 应用测试 | webapp-testing |
| | Web 工件构建器 | web-artifacts-builder |
| 协作 | 文档协作 | doc-coauthoring |
| | 内部沟通 | internal-comms |

---

## 六、高级用法

### 1. 组合使用多个技能

```
"使用 pptx 技能创建演示文稿，并使用 brand-guidelines 技能应用 Anthropic 品牌样式"
"使用 xlsx 技能创建财务模型，然后使用 theme-factory 技能应用主题"
```

### 2. 查看可用技能

```bash
# 在 Claude Code 中
/plugin list
```

### 3. 创建自定义技能

使用 `skill-creator` 技能指南创建自己的技能：

```bash
# 初始化技能模板
python scripts/init_skill.py my-skill --path ./skills

# 编辑技能内容
# 编写 SKILL.md 和相关资源

# 打包技能
python scripts/package_skill.py ./skills/my-skill
```

---

## 七、最佳实践

### DO - 推荐做法

| 做法 | 说明 |
|------|------|
| **明确提及技能名称** | 必须指定要使用的技能 |
| **提供足够的上下文** | 帮助技能更好地执行任务 |
| **遵循技能的工作流程** | 每个技能都有特定的步骤 |
| **利用捆绑资源** | 脚本、参考文档、模板等 |
| **测试和验证输出** | 特别是文档处理任务 |

### DON'T - 避免做法

| 做法 | 说明 |
|------|------|
| **不指定技能名称** | Claude 不知道要加载哪个技能 |
| **忽略技能要求** | 如 docx 要求使用修订追踪 |
| **跳过验证步骤** | 如 pptx 要求生成缩略图检查 |
| **假设技能限制** | 很多功能比预期更强大 |

---

## 八、常见问题

### Q: 为什么技能没有触发？

**A:** 检查以下几点：
1. 技能是否已安装
2. 请求描述是否足够清晰
3. 尝试更明确地描述任务需求

### Q: 可以同时使用多个技能吗？

**A:** 可以。例如创建带品牌样式的 PowerPoint 会同时使用 `pptx` 和 `brand-guidelines`。

### Q: 技能输出不符合预期怎么办？

**A:**
1. 提供更具体的反馈
2. 明确指定需要调整的部分
3. 必要时切换到不同的技能或方法

### Q: 如何判断某个任务是否有对应的技能？

**A:** 参考 `agent-skills使用文档.md` 中的"按场景快速查找"表格。

---

## 九、快速参考

### 技能选择速查表

```
文档类 → docx/pdf/pptx/xlsx
设计类 → frontend-design/canvas-design/algorithmic-art/brand-guidelines/theme-factory/slack-gif-creator
开发类 → mcp-builder/skill-creator/webapp-testing/web-artifacts-builder
协作类 → doc-coauthoring/internal-comms
```

### 典型工作流

```
文档编辑工作流：
需求 → 技能触发 → 读取/分析文档 → 执行编辑 → 验证输出 → 完成

设计创建工作流：
需求 → 技能触发 → 设计思考 → 创建 → 迭代改进 → 输出

开发构建工作流：
需求 → 技能触发 → 规划 → 实现 → 测试 → 部署
```

---

## 十、总结

**核心要点：**

1. **明确指定技能名称** → 必须提及要使用的技能（如 "使用 docx 技能"）
2. **信任专业指令** → 技能包含领域专家知识
3. **遵循工作流程** → 每个技能都有最佳实践
4. **反馈和迭代** → 根据输出质量调整请求

**记住：** 使用 Agent Skills 时，**必须明确提及技能名称**才能触发相应的专业能力。

**正确示例：**

- ✅ "使用 **docx 技能**帮我编辑这个 Word 文档"
- ✅ "Use the **PDF skill** to extract form fields"
- ❌ "帮我编辑这个 Word 文档"（未指定技能）
