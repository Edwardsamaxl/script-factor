# 剧本工坊 - 系统架构设计方案

> 本文档定义前后端通信机制、Agent 交互模式、AI 生成管道

---

## 1. 技术选型与底模决策

### 1.1 核心 LLM（剧本/人设生成）

| 服务商 | 模型 | 用途 | 状态 |
|--------|------|------|------|
| **Claude** | claude-sonnet-4-20250514 | 人设生成、剧本生成 | ✅ 已集成 |
| Claude | claude-opus-4-20250514 | 复杂推理、高质量剧本 | 可选升级 |

**决策理由：**
- Claude 在中文对话生成、角色一致性方面优于 GPT-4
- Sonnet 性价比高，适合 MVP 阶段
- 已有的 `@anthropic-ai/sdk` 集成稳定

### 1.2 AI 创作生成（视频/图像）

| 服务商 | 用途 | API 类型 | 建议 |
|--------|------|----------|------|
| **Seedance** | 视频生成 | REST API | 优先集成，字节自研 |
| **GPT Image (DALL-E 3)** | 图像生成 | OpenAI API | 优先集成 |
| **Flux** | 图像生成 | REST API | 备选 |

**推荐优先级：**
1. 图像生成：DALL-E 3（GPT Image）— 集成简单，效果稳定
2. 视频生成：Seedance — 字节出品，中文支持好

---

## 2. 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         前端 (React SPA)                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │首页     │  │人设广场  │  │剧本创作  │  │AI创作   │           │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘           │
│       └────────────┴────────────┬─┴────────────┘                │
│                                │                                 │
│                    ┌───────────▼───────────┐                     │
│                    │    API Service 层     │                     │
│                    │   (src/services/api)   │                     │
│                    └───────────┬───────────┘                     │
└────────────────────────────────┼────────────────────────────────┘
                                 │ HTTP / SSE
┌────────────────────────────────┼────────────────────────────────┐
│                         后端 (Express)                          │
│                    ┌───────────▼───────────┐                     │
│                    │     API Routes        │                     │
│  ┌─────────────────┼─────────────────────┼────────────────┐  │
│  │                 │                     │                 │  │
│  ▼                 ▼                     ▼                 ▼  │
│ ┌────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐   │
│ │Personas│  │  Scripts   │  │   Scenes   │  │AI Genera- │   │
│ │ Routes │  │  Routes   │  │  Routes    │  │  tion     │   │
│ └────┬───┘  └─────┬──────┘  └─────┬──────┘  └─────┬─────┘   │
│      │            │                │                │          │
│  ┌───▼────────────▼────────────────▼────────────────▼────┐    │
│  │                    Service Layer                      │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │    │
│  │  │Persona      │  │  Script      │  │  AIGC     │  │    │
│  │  │Generator    │  │  Generator   │  │  Service  │  │    │
│  │  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘  │    │
│  │         │                │                 │        │    │
│  │  ┌──────▼────────────────▼─────────────────▼─────┐ │    │
│  │  │              LLM Service (Claude)             │ │    │
│  │  └───────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  外部 AI 服务           │
                    │  • Claude API          │
                    │  • Seedance API        │
                    │  • DALL-E 3 / Flux API │
                    └────────────────────────┘
```

---

## 3. API 设计

### 3.1 基础信息

```
Base URL: http://localhost:3001/api
Content-Type: application/json
```

### 3.2 人设相关

#### GET /api/personas/built-in
获取内置人设列表

**响应：**
```json
{
  "success": true,
  "data": [Persona, ...]
}
```

#### POST /api/personas/generate
从表单数据生成人设

**请求：**
```json
{
  "name": "毒舌影评人",
  "personality": ["犀利", "幽默"],
  "speakingStyle": "直接犀利，喜欢用比喻讽刺",
  "views": ["烂片就该骂", "现在的电影越来越不用心"],
  "background": "..."
}
```

**响应：**
```json
{
  "success": true,
  "data": { /* Persona JSON */ }
}
```

### 3.3 场景相关

#### GET /api/scenes
获取内置场景列表

**响应：**
```json
{
  "success": true,
  "data": [Scene, ...]
}
```

### 3.4 剧本相关

#### POST /api/scripts/generate
同步生成剧本（简单场景）

**请求：**
```json
{
  "personaA": { /* Persona */ },
  "personaB": { /* Persona */ },
  "scene": { /* Scene */ },
  "maxRounds": 10
}
```

**响应（同步）：**
```json
{
  "success": true,
  "data": {
    "id": "script_uuid",
    "title": "...",
    "dialogues": [...],
    "status": "completed"
  }
}
```

#### POST /api/scripts/generate-async
异步生成剧本（SSE 流式）

**请求：**
```json
{
  "personaA": { /* Persona */ },
  "personaB": { /* Persona */ },
  "scene": { /* Scene */ },
  "maxRounds": 10
}
```

**响应（SSE）：**
```
event: init
data: {"scriptId": "uuid", "status": "generating"}

event: progress
data: {"round": 3, "total": 10, "progress": 0.3}

event: dialogue
data: {"speaker": "A", "content": "...", "round": 1}

event: dialogue
data: {"speaker": "B", "content": "...", "round": 2}

event: done
data: {"scriptId": "uuid", "status": "completed", "title": "..."}
```

#### GET /api/scripts/:id
获取剧本详情（轮询模式备选）

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "personaA": { "id": "...", "name": "..." },
    "personaB": { "id": "...", "name": "..." },
    "scene": { "id": "...", "name": "..." },
    "dialogues": [...],
    "status": "completed",
    "createdAt": 1745587200000
  }
}
```

### 3.5 AI 生成相关

#### POST /api/ai/generate
发起 AI 创作任务（视频/图像）

**请求：**
```json
{
  "scriptId": "uuid",
  "type": "video" | "image",
  "mode": "cover" | "storyboard" | "character",
  "provider": "seedance" | "dalle" | "flux"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "taskId": "task_uuid",
    "status": "pending",
    "prompt": "生成的 prompt"
  }
}
```

#### GET /api/ai/tasks/:taskId
查询 AI 任务状态

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "task_uuid",
    "type": "video",
    "provider": "seedance",
    "status": "processing" | "success" | "failed",
    "progress": 0.8,
    "output": {
      "resultUrl": "https://...",
      "thumbnails": ["..."]
    },
    "error": null
  }
}
```

---

## 4. 前端 API Service 层

### 4.1 文件结构

```
src/services/
├── api.js           # 统一封装 fetch + error handling
├── personaService.js # 人设相关 API
├── sceneService.js  # 场景相关 API
├── scriptService.js # 剧本相关 API
└── aigcService.js   # AI 生成相关 API
```

### 4.2 核心封装 (api.js)

```javascript
// src/services/api.js
const API_BASE = 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };

  const response = await fetch(url, config);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'API Error');
  }
  return result.data;
}

export { request };
```

### 4.3 剧本服务 (scriptService.js)

```javascript
// src/services/scriptService.js
import { request } from './api';

// 同步生成
async function generateScript(personaA, personaB, scene, maxRounds) {
  return request('/scripts/generate', {
    method: 'POST',
    body: JSON.stringify({ personaA, personaB, scene, maxRounds })
  });
}

// 异步生成 - SSE
async function generateScriptStream(personaA, personaB, scene, maxRounds, callbacks) {
  const response = await fetch(`${API_BASE}/scripts/generate-async`, {
    method: 'POST',
    body: JSON.stringify({ personaA, personaB, scene, maxRounds }),
    headers: { 'Content-Type': 'application/json' }
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('event:')) {
        const eventType = line.slice(6).trim();
        // 读取下一行 data:
      }
      if (line.startsWith('data:')) {
        const data = JSON.parse(line.slice(5));
        callbacks[data.event]?.(data);
      }
    }
  }
}

export { generateScript, generateScriptStream };
```

---

## 5. 前后端交互模式

### 5.1 页面与后端交互

```
┌─────────────────────────────────────────────────────────────────┐
│  首页 (HomePage)                                                 │
│    ├─ usePersonas() → GET /api/personas/built-in               │
│    └─ useScripts() → GET /api/scripts/:id (localStorage)        │
│                                                                  │
│  人设创建页 (PersonaCreatePage)                                  │
│    └─ createPersona() → POST /api/personas/generate             │
│                                                                  │
│  剧本创作页 (ScriptCreatePage)                                    │
│    ├─ loadScenes() → GET /api/scenes                            │
│    ├─ loadPersonas() → GET /api/personas/built-in               │
│    └─ generateScript() → POST /api/scripts/generate-async (SSE)│
│                                                                  │
│  剧本详情页 (ScriptDetailPage)                                    │
│    └─ loadScript() → GET /api/scripts/:id                       │
│                                                                  │
│  AI创作页 (AICreatePage)                                         │
│    ├─ buildPrompt() → 根据剧本生成 AI prompt                     │
│    └─ generateAIGC() → POST /api/ai/generate                    │
│                                                                  │
│  创作中心 (AIHubPage)                                            │
│    └─ pollTasks() → GET /api/ai/tasks/:taskId (轮询)           │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 实时交互（SSE）

剧本生成采用 SSE 实时推送，用户体验流程：

```
[用户点击"生成剧本"]
        │
        ▼
[前端 POST /api/scripts/generate-async]
        │
        ▼
[后端立即返回 SSE 连接]
        │
        ├─── event: init ───→ 显示"开始生成..."
        │
        ├─── event: progress ──→ 更新进度条 (30%)
        │
        ├─── event: dialogue ──→ 实时显示对话 (逐条显示)
        │       1. 催婚大妈：年终奖发了吗？
        │       2. 反卷青年：...（显示中）
        │
        ├─── event: dialogue ──→ 继续显示
        │
        └─── event: done ───→ 生成完成，显示完整剧本
```

---

## 6. Agent 交互机制

### 6.1 Agent 职责划分

| Agent | 职责 | 触发时机 | 输出 |
|--------|------|----------|------|
| **Persona Agent** | 人设生成/蒸馏 | 用户提交表单 | Persona JSON |
| **Script Agent** | 剧本对话生成 | 用户选择人设+场景 | Script JSON |
| **AIGC Agent** | AI 创作（视频/图像） | 用户点击"发送到 AI" | Task ID + 结果 URL |

### 6.2 Agent 协作流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Flow with Agents                        │
└─────────────────────────────────────────────────────────────────┘

[用户填写人设表单]
        │
        ▼
┌───────────────────┐
│   Persona Agent   │ ←── POST /api/personas/generate
│   (Claude Sonnet)  │
└─────────┬─────────┘
          │ Persona JSON
          ▼
[人设保存到 localStorage]

[用户选择人设A + 人设B + 场景]
        │
        ▼
┌───────────────────┐
│   Script Agent    │ ←── POST /api/scripts/generate-async (SSE)
│   (Claude Sonnet)  │
└─────────┬─────────┘
          │ Script JSON (实时流式)
          ▼
[剧本保存到 localStorage]

[用户点击"发送到 AI"]
        │
        ▼
┌───────────────────┐
│   AIGC Agent      │ ←── POST /api/ai/generate
│   (Seedance/DALL-E)│
└─────────┬─────────┘
          │ Task ID
          ▼
[创作中心轮询任务状态]
        │
        ├─── processing ──→ 显示进度
        │
        └─── success ───→ 显示生成结果
```

### 6.3 Agent 内部通信

**同步调用（简单场景）：**
```
Frontend → API Route → Service → LLM → Response
```

**异步流式（剧本生成）：**
```
Frontend → API Route → Service → [LLM (streaming)] → SSE → Frontend
                                    │
                                    └──→ 存储到 Script Store
```

---

## 7. AI 生成管道

### 7.1 Prompt 生成策略

```javascript
// 视频封面 Prompt
function buildVideoCoverPrompt(script) {
  return `Create cinematic cover for "${script.title}".
Scene: ${script.scene.name} - ${script.scene.description}
Characters: ${script.personaA.name} and ${script.personaB.name}
Dialogue excerpt: "${script.dialogues[0]?.content}"
Style: Modern Chinese drama, high contrast, emotional atmosphere.`;
}

// 分镜图 Prompt
function buildStoryboardPrompt(script) {
  const panels = script.dialogues.map((d, i) =>
    `Panel ${i + 1}: [${d.speaker}] ${d.content}`
  ).join('\n');

  return `Create ${script.dialogues.length}-panel storyboard for "${script.title}".
${panels}
Style: Comic book style, clear visual storytelling, Chinese aesthetic.`;
}

// 角色图 Prompt
function buildCharacterPrompt(persona) {
  return `Portrait of ${persona.name}.
Personality: ${persona.personality.join(', ')}
Speaking style: ${persona.speakingStyle}
Style: Digital illustration, expressive, Chinese animation style.`;
}
```

### 7.2 图像生成流程

```
[用户选择"生成角色图"]
        │
        ▼
[前端调用 buildCharacterPrompt(persona)]
        │
        ▼
[POST /api/ai/generate { type: "image", mode: "character" }]
        │
        ▼
[AIGC Service 调用 DALL-E 3 / Flux API]
        │
        ├─── success → 返回 resultUrl
        │
        └─── failed → 返回 error + 备选方案
```

### 7.3 视频生成流程

```
[用户选择"生成视频封面"]
        │
        ▼
[前端调用 buildVideoCoverPrompt(script)]
        │
        ▼
[POST /api/ai/generate { type: "video", mode: "cover" }]
        │
        ▼
[AIGC Service 调用 Seedance API]
        │
        ├─── pending → 返回 taskId
        │
        ▼
[前端轮询 GET /api/ai/tasks/:taskId]
        │
        ├─── processing → 更新进度
        │
        ├─── success → 返回 resultUrl + thumbnails
        │
        └─── failed → 显示错误 + 重试按钮
```

---

## 8. 数据流与状态管理

### 8.1 状态存储位置

| 数据类型 | 存储位置 | 说明 |
|----------|----------|------|
| 用户创建的人设 | localStorage | 持久化 |
| 剧本历史 | localStorage | 持久化 |
| 内置人设/场景 | 后端 API | 启动时加载 |
| AI 生成任务 | 后端 + localStorage | 任务状态在后端，结果缓存 |
| 当前会话 | React Context | 内存，页面切换保留 |

### 8.2 Context 划分

```
UserContext      → 当前用户信息
PersonaContext   → 人设列表 + 操作方法
ScriptContext    → 剧本列表 + 当前剧本 + 生成状态
AIGCContext      → AI 任务列表 + 状态
```

### 8.3 剧本生成状态流

```
idle → generating → completed / failed

generateScript() {
  setStatus('generating')
  setProgress(0)
  setDialogues([])

  generateScriptStream(personaA, personaB, scene, maxRounds, {
    onInit: (scriptId) => setScriptId(scriptId),
    onProgress: (p) => setProgress(p),
    onDialogue: (d) => appendDialogue(d),
    onDone: (title) => {
      setTitle(title)
      setStatus('completed')
      saveToLocalStorage()
    },
    onError: (err) => setStatus('failed')
  })
}
```

---

## 9. 错误处理机制

### 9.1 分层错误处理

| 层级 | 错误类型 | 处理方式 |
|------|----------|----------|
| **网络层** | 请求失败、超时 | 重试 3 次 + 用户提示 |
| **API 层** | 4xx/5xx 响应 | 解析 error 字段，显示友好消息 |
| **LLM 层** | Claude API 错误 | 回退到缓存数据或降级提示 |
| **AIGC 层** | 生成失败 | 显示错误 + 提供重试按钮 |

### 9.2 重试策略

```javascript
// API 请求重试
async function requestWithRetry(endpoint, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await request(endpoint, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(Math.pow(2, i) * 1000); // 指数退避
    }
  }
}
```

---

## 10. 安全考虑

### 10.1 API 安全

- CORS 配置：只允许前端域名
- 请求限流：防止滥用（后续扩展）
- 输入验证：后端校验所有输入字段

### 10.2 密钥管理

```
.env
├── ANTHROPIC_API_KEY=sk-...
├── SEEDANCE_API_KEY=...  (后续)
├── OPENAI_API_KEY=...     (后续)
```

> **重要**：所有密钥存储在后端 .env，前端不暴露任何 API 密钥

---

## 11. 实施计划

### Phase 1: 核心连接（1天）
- [ ] 创建 server.js 入口
- [ ] 完成 scripts.js 路由 + SSE 支持
- [ ] 完成 scenes.js 路由
- [ ] 前端 api.js 服务层
- [ ] 前后端联调

### Phase 2: AI 通道（1天）
- [ ] AIGC Service 实现
- [ ] DALL-E 3 图像生成集成
- [ ] Seedance 视频生成集成（待 API 开放）
- [ ] 创作中心页面

### Phase 3: 优化（半天）
- [ ] 错误处理完善
- [ ] 加载状态优化
- [ ] 断线重连

---

## 12. 文件结构总览

```
script-factor/
├── src/
│   ├── server/
│   │   ├── server.js              # Express 入口 ⭐ 新增
│   │   ├── routes/
│   │   │   ├── personas.js        # ✅ 已实现
│   │   │   ├── scripts.js         # ⭐ SSE + 异步生成
│   │   │   ├── scenes.js          # ⭐ 简化 CRUD
│   │   │   └── aigc.js            # ⭐ AI 生成路由
│   │   ├── services/
│   │   │   ├── llm.js             # ✅ 已实现
│   │   │   ├── personaGenerator.js # ✅ 已实现
│   │   │   ├── scriptGenerator.js  # ⭐ 增 SSE 支持
│   │   │   └── aigcService.js     # ⭐ 图像/视频生成
│   │   ├── prompts/               # ✅ 已实现
│   │   └── data/                  # ✅ 已实现
│   ├── services/                   # 前端 API 层
│   │   ├── api.js                 # ⭐ 统一封装
│   │   ├── personaService.js      # ⭐
│   │   ├── sceneService.js        # ⭐
│   │   ├── scriptService.js       # ⭐ SSE 支持
│   │   └── aigcService.js        # ⭐
│   └── ...
├── .env                           # ⭐ API 密钥
└── ARCHITECTURE.md                # 本文档
```

---

## 附录 A: SSE 前端示例

```javascript
// useScriptGeneration.js
function useScriptGeneration() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [dialogues, setDialogues] = useState([]);

  const startGeneration = async (personaA, personaB, scene) => {
    setStatus('generating');

    const response = await fetch(`${API_BASE}/scripts/generate-async`, {
      method: 'POST',
      body: JSON.stringify({ personaA, personaB, scene, maxRounds: 10 }),
      headers: { 'Content-Type': 'application/json' }
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = JSON.parse(line.slice(5));

        switch (data.type) {
          case 'progress':
            setProgress(data.progress);
            break;
          case 'dialogue':
            setDialogues(prev => [...prev, data]);
            break;
          case 'done':
            setStatus('completed');
            break;
        }
      }
    }
  };

  return { status, progress, dialogues, startGeneration };
}
```

---

## 附录 B: 第三方 API 文档

| 服务 | 文档链接 | 备注 |
|------|----------|------|
| Claude API | https://docs.anthropic.com/ | ✅ 已集成 |
| Seedance | 待官方发布 | 字节视频生成 |
| DALL-E 3 | https://platform.openai.com/docs/guides/images | OpenAI 官方 |
| Flux | https://flux.ai/docs | 最新图像模型 |
