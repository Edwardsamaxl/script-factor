# 剧本工坊 ScriptStudio

> 两个人设，一个故事

AI 对话剧本生成平台。选择两个人设 + 场景，双 LLM Agent 交替对话生成剧本，自动产出故事板和视频脚本。

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 19 + Vite 6 | SPA |
| 路由 | React Router v7 | 页面路由 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 后端 | Express 4.18 | RESTful API + SSE 流式推送 |
| AI SDK | OpenAI SDK (DeepSeek API) | LLM 调用封装 |
| AI 图像 | OpenAI DALL-E 3 | 图像生成 |
| 持久化 | JSON 文件 | 文件存储 |

---

## 快速上手

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 前端依赖
npm install

# 后端依赖
cd src/server && npm install && cd ../..
```

### 配置

```bash
# 后端需要 DEEPSEEK_API_KEY（在 src/server/ 下创建 .env）
echo "DEEPSEEK_API_KEY=your_key_here" > src/server/.env
```

### 开发

```bash
# 同时启动前后端
npm run dev:full
# 前端: http://localhost:5173
# 后端: http://localhost:3001
```

### 构建

```bash
npm run build   # 输出到 dist/
```

---

## 项目结构

```
scriptstudio/
├── src/
│   ├── App.jsx                 # 根组件 + 路由配置
│   ├── main.jsx                # 入口文件
│   ├── index.css               # 全局样式（Tailwind）
│   │
│   ├── components/
│   │   ├── common/             # 通用组件
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── TagInput.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── TabBar.jsx
│   │   ├── persona/
│   │   │   ├── PersonaCard.jsx     # 人设卡片（广场/列表用）
│   │   │   ├── PersonaForm.jsx     # 人设创建/编辑表单
│   │   │   └── PersonaPreview.jsx  # 人设预览（选人设时）
│   │   ├── script/
│   │   │   ├── ScriptCard.jsx         # 剧本卡片
│   │   │   ├── ScriptViewer.jsx       # 剧本详情（故事板/视频脚本/对话三Tab）
│   │   │   └── GenerationProgress.jsx # 生成进度动画
│   │   └── scene/
│   │       └── SceneSelector.jsx      # 场景选择
│   │
│   ├── pages/
│   │   ├── HomePage.jsx               # / 首页
│   │   ├── PersonaCreatePage.jsx      # /persona/create 创建/编辑人设
│   │   ├── PersonaDetailPage.jsx      # /persona/:id 人设详情
│   │   ├── PersonaSquarePage.jsx      # /persona/square 人设广场
│   │   ├── ScriptCreatePage.jsx       # /script/create 创作剧本（3步+SSE）
│   │   ├── ScriptDetailPage.jsx       # /script/:id 剧本详情
│   │   ├── AICreatePage.jsx           # /ai/create/:scriptId AI创作
│   │   ├── AIHubPage.jsx              # /ai/hub 创作中心
│   │   └── ProfilePage.jsx            # /profile 个人中心
│   │
│   ├── context/
│   │   ├── UserContext.jsx        # 用户状态（localStorage）
│   │   ├── PersonaContext.jsx     # 人设状态（API -> 后端）
│   │   └── ScriptContext.jsx      # 剧本状态（API -> 后端）
│   │
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   ├── usePersonas.js
│   │   └── useScripts.js
│   │
│   ├── data/
│   │   └── scenes.js             # 前端场景数据（备用）
│   │
│   ├── utils/
│   │   ├── promptBuilder.js      # 前端 prompt 拼接
│   │   └── scriptParser.js       # 剧本格式化
│   │
│   └── server/                   # 后端 Express 服务
│       ├── app.js                # Express 应用入口
│       ├── server.js             # 服务器启动
│       │
│       ├── routes/
│       │   ├── personas.js       # 人设 CRUD + 点赞 + 使用 + AI生成
│       │   ├── scripts.js        # 剧本 CRUD + 双LLM生成 + SSE流 + 故事板
│       │   ├── scenes.js         # 场景查询
│       │   └── aigc.js           # AI图像/视频生成任务
│       │
│       ├── services/
│       │   ├── llm.js                 # LLM 封装（双客户端 + 重试）
│       │   ├── personaGenerator.js    # AI人设生成
│       │   ├── scriptGenerator.js     # 单轮剧本生成
│       │   ├── multiTurnGenerator.js  # 双LLM多轮对话生成
│       │   ├── sessionStore.js        # 对话会话管理 + 队列
│       │   ├── scriptSummarizer.js    # 故事板 + 视频脚本生成
│       │   └── aigcService.js         # DALL-E / Flux / 视频(占位)
│       │
│       ├── prompts/
│       │   ├── persona-generation.md
│       │   ├── script-generation.md
│       │   └── dialogue-turn.md
│       │
│       ├── data/
│       │   ├── built-in-personas.json  # 内置人设
│       │   ├── user-personas.json      # 用户人设（运行时生成）
│       │   ├── scenes.json             # 场景列表
│       │   ├── scripts.json            # 剧本存储（运行时生成）
│       │   └── sessions.json           # 生成会话（运行时生成）
│       │
│       └── test/
│           ├── persona.test.js
│           ├── script.test.js
│           └── dual-llm.test.js
│
├── PRD.md                  # 产品需求文档
└── vite.config.js          # Vite 配置
```

---

## 数据模型

### 人设 Persona（实际字段）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 自动 | 唯一标识 |
| `name` | string | ✅ | 人设名称 |
| `avatar` | string | - | 头像 emoji |
| `creator` | string | 自动 | `'user'` 或 `'system'` |
| `coreView` | string | ✅ | 核心观点（一段话） |
| `speakingStyle` | string | ✅ | 说话风格（方言、口头禅等） |
| `actionStyle` | string | ✅ | 行动风格（小动作、习惯等） |
| `background` | string | - | 背景故事 |
| `imagePrompt` | string | - | AI 生图英文 prompt（自动生成） |
| `imageUrl` | string | - | AI 生图结果 URL |
| `isFavorited` | boolean | 自动 | 是否收藏 |
| `usageCount` | number | 自动 | 使用次数 |
| `likeCount` | number | 自动 | 点赞数 |
| `isPublic` | boolean | - | 是否公开 |
| `isPremium` | boolean | 自动 | 是否付费 |

### 剧本 Script

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | UUID |
| `title` | string | 标题 |
| `personaA/personaB` | object | `{ id, name, avatar, coreView, speakingStyle, actionStyle, background }` |
| `scene` | object | `{ id, name, description }` |
| `dialogues` | array | `[{ speaker: 'A'\|'B', content }]` |
| `totalLines` | number | 对话轮数 |
| `wordCount` | number | 总字数 |
| `storyboard` | object | 故事板：`{ title, totalScenes, scenes: [{ id, setting, characters, action, dialogue, emotion, visualPrompt }] }` |
| `summary` | object | 视频脚本：`{ videoPrompt, duration, emotion, style }` |

### 场景 Scene

```javascript
{ id: string, name: string, description: string, prompt: string, isBuiltIn: boolean }
```

---

## 核心流程：剧本生成

```
用户操作：选择人设A → 选择人设B → 选择场景 → 点击"开始生成"
                                                        │
前端调用 POST /api/scripts/generate-multi               │
  ├─ 返回 { scriptId, status: 'generating' }             │
  └─ 打开 SSE GET /api/scripts/:id/stream               │
                                                        ▼
后端异步执行 ────────────────────────────────────────────→
  Round 1  LLM A → Persona A 发言  → SSE dialogue
  Round 2  LLM B → Persona B 发言  → SSE dialogue
  Round 3  LLM A → Persona A 发言  → SSE dialogue
  ... 交替进行，最多10轮 ...
  [END] 或 连续短回复 → 对话结束
                                                        │
  对话完成后（并行）：                                     │
  ├─ summarizeToStoryboard()   → storyboard
  └─ summarizeToScriptSummary() → summary
                                                        │
  completeSession() → SSE done                          │
                                                        ▼
前端收到 done → 保存剧本 → 跳转 /script/:id 详情页
               └→ 如 storyboard 未就绪，每1秒轮询等待
```

---

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/health` | 健康检查 |
| `GET` | `/api/personas/built-in` | 内置人设 |
| `GET` | `/api/personas` | 用户人设 |
| `POST` | `/api/personas` | 创建人设（直接保存） |
| `PUT` | `/api/personas/:id` | 更新人设 |
| `DELETE` | `/api/personas/:id` | 删除人设 |
| `POST` | `/api/personas/generate` | AI辅助生成人设 |
| `POST` | `/api/personas/:id/like` | 点赞/取消 |
| `POST` | `/api/personas/:id/use` | 记录使用 |
| `GET` | `/api/personas/favorites` | 已收藏列表 |
| `GET` | `/api/scenes` | 场景列表 |
| `GET` | `/api/scripts` | 剧本列表 |
| `POST` | `/api/scripts` | 保存剧本 |
| `POST` | `/api/scripts/generate` | 单轮生成 |
| `POST` | `/api/scripts/generate-multi` | 双LLM多轮生成 |
| `GET` | `/api/scripts/:id` | 轮询状态 |
| `GET` | `/api/scripts/:id/stream` | SSE流式推送 |
| `POST` | `/api/scripts/:id/summarize` | 手动生成故事板 |
| `POST` | `/api/ai/generate` | AI图像/视频生成 |
| `GET` | `/api/ai/tasks` | 任务列表 |
| `GET` | `/api/ai/tasks/:taskId` | 任务状态 |

---

## 内置数据

### 内置人设（2个）

| 名称 | 核心观点 | 说话风格 | 行动风格 |
|------|---------|---------|---------|
| **佳宜** 👩‍💼 | 丁克、不结婚、为自己而活 | 客气→毒舌、逻辑碾压 | 被惹怒后扇耳光 |
| **王大妈** 👵 | 养儿防老、女必嫁人 | 杭州方言、阴阳怪气 | 紧张放屁、戳人说话 |

### 内置场景（3个）

| 场景 | 描述 |
|------|------|
| **过年催婚** | 家庭聚会催婚连环攻势 |
| **亲戚盘问** | 七大姑八大姨问工资/对象/买房 |
| **工作交接** | 老员工推活给实习生 |

| 场景 | 描述 |
|------|------|
| **过年催婚** | 家庭聚会催婚连环攻势 |
| **亲戚盘问** | 七大姑八大姨问工资/对象/买房 |
| **工作交接** | 老员工推活给实习生 |

---

## 后端 LLM 配置

| 服务 | model | temperature | max_tokens | 重试 |
|------|-------|------------|------------|------|
| personaGenerator | deepseek-chat | 0.7 | 4096 | 3次 |
| scriptGenerator | deepseek-chat | 0.8 | 8192 | 3次 |
| multiTurn (LLM A) | deepseek-chat | 0.8 | 1024 | 3次 |
| multiTurn (LLM B) | deepseek-chat | 0.8 | 1024 | 3次 |

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | **必填** |
| `PORT` | 后端端口 | 3001 |
| `OPENAI_API_KEY` | DALL-E 图像用 | 回退 DEEPSEEK_API_KEY |

---

## 测试

```bash
cd src/server
node test/persona.test.js     # 人设生成（5个用例）
node test/script.test.js      # 剧本生成（6个用例）
node test/dual-llm.test.js    # 双LLM通信测试
```
