# 搭映 (ScriptStudio)

> 两个人设，一个故事

**搭映** 是一个 AI 对话剧本创作平台。它的工作方式很简单：你创建或选择两个"人设"（Persona），设定一个场景，两个 AI Agent 会以这些人设的身份进行即兴对话，自动生成完整的对话剧本 + 故事板 + 视频脚本。

---

## 它解决什么问题？

写对话剧本是一件"看起来简单，动手就卡壳"的事：

- 角色之间的化学反应很难凭空想象
- 写 10 轮对话就要反复调整语气和立场的一致性
- 故事板和分镜是另一套劳动，不在大多数编剧的创作流里

搭映的做法是：**把人设从剧本里抽象出来**。人设是独立的可复用资产，选两个人设扔进一个场景，AI 自动演完一整段戏。

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
# 后端需要 DeepSeek API 密钥
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

## 核心流程：三步行活一部戏

```
Step 1: 准备人设 → 创建或从广场挑选两个角色
Step 2: 选择场景 → 过年催婚 / 亲戚盘问 / 工作交接
Step 3: 生成剧本 → 双 LLM 实时对话，SSE 流式推送
```

生成过程是全自动的：

```
用户点击"开始生成"
        │
POST /api/scripts/generate-multi
        │
        ▼
Round 1  LLM A → Persona A 发言  → SSE 推送到前端
Round 2  LLM B → Persona B 发言  → SSE 推送到前端
Round 3  LLM A → Persona A 发言  → SSE 推送到前端
... 交替进行，最多 10 轮 ...
[END] 或连续短回复 → 对话结束
        │
  对话完成后（并行）：
  ├─ 生成故事板（AI 生图用）
  └─ 生成视频脚本（AI 视频用）
        │
        ▼
前端跳转剧本详情页（对话 / 故事板 / 视频脚本三 Tab）
```

---

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端 | React 19 + Vite 6 | SPA |
| 路由 | React Router v7 | 页面路由 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 后端 | Express 4.18 | RESTful + SSE |
| AI SDK | OpenAI SDK (DeepSeek API) | LLM 调用 |
| AI 图像 | DALL-E 3 | 人设/故事板生图 |
| 持久化 | JSON 文件 | 零依赖存储 |

---

## 项目结构

```
搭映/
├── src/
│   ├── App.jsx                      # 根组件 + 路由
│   ├── main.jsx                     # 入口
│   ├── index.css                    # Tailwind 全局样式
│   │
│   ├── components/
│   │   ├── common/                  # Button, Modal, TagInput
│   │   ├── layout/                  # Navbar, TabBar
│   │   ├── persona/                 # PersonaCard, PersonaForm, PersonaPreview
│   │   ├── script/                  # ScriptCard, ScriptViewer, GenerationProgress
│   │   └── scene/                   # SceneSelector
│   │
│   ├── pages/                       # 10 个页面组件
│   │   ├── HomePage.jsx             # /
│   │   ├── PersonaCreatePage.jsx    # /persona/create
│   │   ├── PersonaSquarePage.jsx    # /persona/square
│   │   ├── PersonaDetailPage.jsx    # /persona/:id
│   │   ├── ScriptCreatePage.jsx     # /script/create（3 步 + SSE）
│   │   ├── ScriptDetailPage.jsx     # /script/:id（3 Tab）
│   │   ├── AICreatePage.jsx         # /ai/create/:scriptId
│   │   ├── AIHubPage.jsx            # /ai/hub
│   │   ├── ProfilePage.jsx          # /profile
│   │   ├── MyPersonasPage.jsx       # /my/personas
│   │   └── MyScriptsPage.jsx        # /my/scripts
│   │
│   ├── context/                     # UserContext, PersonaContext, ScriptContext
│   ├── hooks/                       # useLocalStorage, usePersonas, useScripts
│   ├── data/                        # 前端场景数据（备用）
│   └── utils/                       # promptBuilder, scriptParser
│
├── src/server/                      # 后端（Embedded Express）
│   ├── app.js                       # Express 入口
│   ├── server.js                    # 服务器启动
│   ├── routes/                      # personas, scripts, scenes, aigc
│   ├── services/                    # llm, personaGenerator, scriptGenerator,
│   │                                # multiTurnGenerator, sessionStore,
│   │                                # scriptSummarizer, aigcService
│   ├── prompts/                     # prompt 模板（.md）
│   ├── data/                        # JSON 文件存储
│   └── test/                        # 3 个测试文件
│
├── vite.config.js
└── index.html
```

---

## API 端点

### 人设 (Personas)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/personas/built-in` | 内置人设列表 |
| `GET` | `/api/personas` | 用户人设列表 |
| `POST` | `/api/personas` | 创建人设 |
| `PUT` | `/api/personas/:id` | 更新人设 |
| `DELETE` | `/api/personas/:id` | 删除人设 |
| `POST` | `/api/personas/generate` | AI 辅助生成人设 |
| `POST` | `/api/personas/:id/like` | 点赞/取消 |
| `POST` | `/api/personas/:id/use` | 记录使用 |
| `GET` | `/api/personas/favorites` | 已收藏列表 |

### 剧本 (Scripts)

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/scripts/generate-multi` | 双 LLM 多轮生成 |
| `GET` | `/api/scripts/:id/stream` | SSE 流式推送 |
| `GET` | `/api/scripts/:id` | 轮询状态 |
| `POST` | `/api/scripts` | 保存剧本 |
| `PUT` | `/api/scripts/:id` | 更新剧本 |
| `DELETE` | `/api/scripts/:id` | 删除剧本 |
| `POST` | `/api/scripts/:id/summarize` | 手动生成故事板 |

### AI 创作

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/ai/generate` | AI 图像生成 |
| `GET` | `/api/ai/tasks` | 任务列表 |
| `GET` | `/api/ai/tasks/:taskId` | 任务状态 |

### 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/health` | 健康检查 |
| `GET` | `/api/scenes` | 场景列表 |

---

## 数据模型

### 人设 (Persona)

```javascript
{
  id: 'user-1714500000000',
  name: '佳宜',
  avatar: '👩‍💼',
  creator: 'user',                    // 'user' | 'system'
  coreView: '丁克，为自己而活...',      // 核心观点（必填）
  speakingStyle: '被惹怒后毒舌...',    // 说话风格（必填）
  actionStyle: '被惹怒后扇耳光...',    // 行动风格（必填）
  background: '985 名校毕业...',       // 背景故事（选填）
  imagePrompt: '...',                 // AI 生图 prompt（自动生成）
  imageUrl: null,                     // AI 生图结果
  isFavorited: false,
  usageCount: 128,
  likeCount: 45,
  isPublic: true,
  isPremium: false
}
```

### 剧本 (Script)

```javascript
{
  id: 'uuid',
  title: '过年催婚风波',
  personaA: { /* 人设 A 快照 */ },
  personaB: { /* 人设 B 快照 */ },
  scene: { id: '场景-过年催婚', name: '过年催婚', description: '...' },
  dialogues: [
    { speaker: 'A', content: '...' },
    { speaker: 'B', content: '...' }
  ],
  totalLines: 10,
  wordCount: 850,
  storyboard: {                       // 故事板（AI 生图用）
    title: 'Storyboard: ...',
    totalScenes: 4,
    scenes: [{
      id: 1,
      setting: '场景环境',
      characters: ['佳宜', '王大妈'],
      action: '角色动作',
      dialogue: '关键对白',
      emotion: '情绪基调',
      visualPrompt: '英文 AI 生图 prompt'
    }]
  },
  summary: {                          // 视频脚本（AI 视频用）
    videoPrompt: '...',
    duration: '10秒',
    emotion: 'tension',
    style: '电影感'
  }
}
```

---

## LLM 配置

| 服务 | model | temperature | max_tokens | 重试 |
|------|-------|------------|------------|------|
| 人设生成 | deepseek-chat | 0.7 | 4096 | 3 次 |
| 单轮剧本 | deepseek-chat | 0.8 | 8192 | 3 次 |
| 多轮对话 (LLM A) | deepseek-chat | 0.8 | 1024 | 3 次 |
| 多轮对话 (LLM B) | deepseek-chat | 0.8 | 1024 | 3 次 |
| 故事板生成 | deepseek-chat | 0.7 | 4096 | 3 次 |
| 视频脚本生成 | deepseek-chat | 0.7 | 1024 | 3 次 |

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | **必填** |
| `PORT` | 后端端口 | 3001 |
| `OPENAI_API_KEY` | DALL-E 图像用 | 回退 DEEPSEEK_API_KEY |

---

## 内置数据

### 人设

| 名称 | 核心观点 | 说话风格 | 行动风格 |
|------|---------|---------|---------|
| **佳宜** 👩‍💼 | 丁克、不结婚、为自己而活 | 客气→毒舌、逻辑碾压 | 被惹怒后扇耳光 |
| **王大妈** 👵 | 养儿防老、女必嫁人 | 杭州方言、阴阳怪气 | 紧张放屁、戳人说话 |

### 场景

| 场景 | 描述 |
|------|------|
| **过年催婚** | 家庭聚会催婚连环攻势 |
| **亲戚盘问** | 七大姑八大姨问工资/对象/买房 |
| **工作交接** | 老员工推活给实习生 |

---

## 测试

```bash
cd src/server
node test/persona.test.js     # 人设生成（5 个用例）
node test/script.test.js      # 剧本生成（6 个用例）
node test/dual-llm.test.js    # 双 LLM 通信测试
```

---

## 设计思路

搭映的核心假设是：**好故事来自好角色的碰撞**。

大多数 AI 剧本工具让你写 prompt 来描述你想要的剧情，但搭映让你先定义"谁在说话"。人设是独立于剧本的资产——你可以创建一个"毒舌都市女性"人设，然后把它和"传统大妈"扔进"过年催婚"场景，AI 自动完成剩下的。

这种"人设蒸馏 + Agent 对话"的模式有两个好处：

1. **人设可复用**——一个好的人设可以用于无数个场景和组合
2. **对话自然**——两个 LLM 各自扮演一个角色对话，比单模型生成对话更接近真实的人类交流

---

## 后续方向

- Flux / Stable Diffusion 图像生成接入
- Seedance / Runway / Pika 视频生成接入
- 用户认证系统
- 人设市场（付费/授权）
- 更多导出格式（TXT / Fountain）
- 更多预设场景和人设
