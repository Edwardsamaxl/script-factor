# 剧本工坊 ScriptStudio

> 两个人设，一个故事

AI 内容创作平台，支持人设蒸馏、Agent 对话生成剧本，并可对接 AI 视频/图像生成工具。

---

## 产品概述

- **一级创作者**：将人物/角色蒸馏为人设资产
- **二级创作者**：选择两个人设 + 场景，生成对话剧本
- **三级创作**：将剧本发送至 Seedance/GPT Image 等工具生成视频/图像

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | React 19 + Vite | 快速开发，热更新 |
| 路由 | React Router v6 | SPA 路由管理 |
| 状态 | React Context + useReducer | 轻量状态管理 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 持久化 | localStorage | 无后端，纯前端存储 |

---

## 快速上手

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

输出在 `dist/` 目录

### 预览构建结果

```bash
npm run preview
```

---

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── common/         # 通用组件（Button, Modal, TagInput）
│   ├── layout/         # 布局组件（Navbar, TabBar）
│   ├── persona/        # 人设相关组件
│   ├── script/         # 剧本相关组件
│   └── scene/          # 场景相关组件
├── context/            # React Context（全局状态）
│   ├── UserContext.jsx
│   ├── PersonaContext.jsx
│   └── ScriptContext.jsx
├── data/               # 静态数据
│   ├── scenes.js       # 预设场景（5个内置场景）
│   └── mockPersonas.js # 演示人设数据
├── hooks/              # 自定义 Hooks
│   ├── useLocalStorage.js
│   ├── usePersonas.js
│   └── useScripts.js
├── pages/              # 页面组件（对应路由）
│   ├── HomePage.jsx            # /
│   ├── PersonaCreatePage.jsx   # /persona/create, /persona/:id
│   ├── PersonaSquarePage.jsx   # /persona/square
│   ├── ScriptCreatePage.jsx    # /script/create
│   ├── ScriptDetailPage.jsx    # /script/:id
│   ├── AICreatePage.jsx        # /ai/create/:scriptId
│   ├── AIHubPage.jsx           # /ai/hub
│   └── ProfilePage.jsx         # /profile
├── utils/               # 工具函数
│   ├── promptBuilder.js  # AI prompt 构造
│   └── scriptParser.js   # 剧本 JSON 解析
├── App.jsx              # 根组件 + 路由配置
└── main.jsx             # 入口文件
```

---

## 核心数据模型

### Persona（人设）

```javascript
{
  id: string,
  name: string,              // "毒舌影评人"
  avatar: string,            // "🎬"
  creator: string,           // 创建者
  personality: string[],      // ["犀利", "幽默"]
  speakingStyle: string,     // "直接犀利，喜欢用比喻"
  views: string[],           // ["烂片就该骂"]
  background: string,        // 背景故事（可选）
  exampleDialogs: Dialog[],
  usageCount: number,        // 被使用次数
  likeCount: number,
  isPublic: boolean,
  isPremium: boolean,
  createdAt: number,
  updatedAt: number
}
```

### Script（剧本）

```javascript
{
  id: string,
  title: string,
  personaA: { id, name, avatar, speakingStyle },
  personaB: { id, name, avatar, speakingStyle },
  scene: { id, name, description },
  dialogues: [{ id, speaker: 'A'|'B', content, emotion? }],
  totalLines: number,
  wordCount: number,
  creator: string,
  createdAt: number
}
```

### Scene（场景）

```javascript
{
  id: string,
  name: string,        // "电影批评"
  description: string,  // "两个人针对一部电影进行深度讨论"
  prompt: string,      // 场景提示词模板
  isBuiltIn: boolean
}
```

---

## LocalStorage 键名

| 键名 | 数据类型 | 说明 |
|------|---------|------|
| `scriptstudio_user` | User | 当前用户 |
| `scriptstudio_personas` | Persona[] | 所有的人设 |
| `scriptstudio_scripts` | Script[] | 生成的剧本 |
| `scriptstudio_scenes` | Scene[] | 场景配置（预留） |
| `scriptstudio_ai_tasks` | AIGCTask[] | AI 创作任务 |

---

## 路由一览

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 首页（最近剧本 + 我的人设） |
| `/persona/create` | PersonaCreatePage | 创建人设 |
| `/persona/:id` | PersonaCreatePage | 编辑人设 |
| `/persona/square` | PersonaSquarePage | 人设广场 |
| `/script/create` | ScriptCreatePage | 创作剧本（3步流程） |
| `/script/:id` | ScriptDetailPage | 剧本详情 |
| `/ai/create/:scriptId` | AICreatePage | AI 创作（发送至视频/图像工具） |
| `/ai/hub` | AIHubPage | 创作中心（任务管理） |
| `/profile` | ProfilePage | 个人中心 |

---

## 常用开发任务

### 添加新的预设场景

编辑 `src/data/scenes.js`，在 `builtInScenes` 数组中添加：

```javascript
{
  id: 'unique-id',
  name: '场景名称',
  description: '场景描述',
  prompt: 'AI 提示词模板',
  isBuiltIn: true,
}
```

### 添加新的 AI 工具

1. 在 `AICreatePage.jsx` 的 `AI_TOOLS` 数组中添加工具配置
2. 在 `promptBuilder.js` 中添加对应的 prompt 生成函数
3. 在 `MODES` 中添加该工具支持的生成模式

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `App.jsx` 中添加路由：

```jsx
<Route path="/new-page" element={<NewPage />} />
```

### 修改人设表单字段

编辑 `src/components/persona/PersonaForm.jsx`

### 调整样式

- 全局样式：`src/index.css`（Tailwind 指令）
- 组件样式：各组件文件的 className
- 设计规范：使用 Tailwind 原子类，保持一致

---

## AI 对接说明

### 剧本生成

目前为模拟模式（在 `ScriptCreatePage.jsx` 中），实际使用时需要：

1. 调用 LLM API（如 Claude/GPT）
2. 将 prompt 通过 `buildScriptPrompt()` 构造
3. 解析返回的 JSON（通过 `parseScriptResponse()`）

### AI 创作（Seedance/GPT Image）

在 `AICreatePage.jsx` 的 `handleSendToAI()` 中：

```javascript
// 当前实现：拼接 prompt 到目标平台的 URL
window.open(`https://platform.ai/create?prompt=${encodedPrompt}`, '_blank')
```

正式对接时替换为各平台的 API 调用。

---

## 部署说明

### 构建

```bash
npm run build
```

### 打包提交

将 `dist/` 目录打包为 ZIP，确保：

- `index.html` 在 ZIP 根目录
- 包体大小 ≤ 8MB

---

## TODO

- [ ] 接入真实 LLM API（Claude/GPT）进行剧本生成
- [ ] 对接 Seedance/GPT Image 官方 API
- [ ] 添加用户认证系统
- [ ] 支持人设市场（付费/授权）
- [ ] 添加收藏功能
- [ ] 剧本模板保存
- [ ] 导出更多格式（TXT/Fountain）
