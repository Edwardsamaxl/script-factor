# Task 2: API 服务报告

## 概述

Task 2 完成了 Express 服务搭建、API 路由和 LLM 封装。

## 服务结构

```
src/server/
├── server.js           # 入口文件
├── app.js              # Express 应用
├── routes/             # API 路由
│   ├── personas.js      # 人设相关 API
│   ├── scenes.js        # 场景相关 API
│   ├── scripts.js       # 剧本相关 API
│   └── aigc.js          # AI 生成 API
├── services/            # 业务逻辑
│   ├── llm.js          # LLM 调用封装
│   ├── personaGenerator.js   # 人设生成器
│   ├── scriptGenerator.js     # 剧本生成器
│   └── sessionStore.js        # 会话状态存储
└── data/               # 内置数据
    ├── built-in-personas.json
    └── scenes.json
```

## API 端点

### 1. GET /api/personas/built-in

获取内置人设列表。

**Response**:
```json
{
  "success": true,
  "data": [Persona JSON...]
}
```

### 2. POST /api/personas/generate

生成新人设。

**Request**:
```json
{
  "name": "...",
  "personality": [...],
  "speakingStyle": "...",
  "views": [...],
  "background": "..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {Persona JSON}
}
```

### 3. GET /api/scenes/built-in

获取内置场景列表。

**Response**:
```json
{
  "success": true,
  "data": [Scene JSON...]
}
```

### 4. POST /api/scripts/generate

生成剧本。

**Request**:
```json
{
  "personaA": {...},
  "personaB": {...},
  "scene": {...},
  "maxRounds": 10
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "title": "...",
    "dialogues": [...],
    "totalLines": 10,
    "wordCount": 850
  }
}
```

### 5. POST /api/aigc/multi-turn

多轮对话生成（流式 SSE）。

**Request**:
```json
{
  "personaA": {...},
  "personaB": {...},
  "scene": {...},
  "maxRounds": 10,
  "sessionId": "optional-session-id"
}
```

**Response**: SSE stream

```
data: {"speaker":"A","content":"...","emotion":"..."}

data: {"done":false}

data: {"speaker":"B","content":"...","emotion":"..."}

data: {"done":true,"summary":{"totalLines":10,"wordCount":850}}
```

### 6. GET /api/aigc/status/:sessionId

获取会话状态。

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "status": "generating|completed|failed",
    "progress": { "current": 5, "total": 10 },
    "dialogues": [...]
  }
}
```

## LLM 封装 (llm.js)

### DeepSeek API

使用 `openai` SDK 连接 DeepSeek API：

```javascript
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});
```

### 核心函数

**callDeepSeek(messages, options)**
- messages: 消息数组
- options: { temperature, max_tokens, max_retries, model }
- 重试机制: 3 次指数退避

**callDeepSeekWithSystem(systemPrompt, userMessages, options)**
- systemPrompt: 系统提示词
- userMessages: 用户消息
- 自动构建消息格式

**向后兼容别名**:
- `callClaude` → `callDeepSeek`
- `callClaudeWithSystem` → `callDeepSeekWithSystem`

## Session Store

会话状态管理：

```javascript
// 创建会话
sessionStore.createSession(initialData)

// 更新进度
sessionStore.updateProgress(sessionId, dialogue)

// 完成会话
sessionStore.completeSession(sessionId, summary)

// 获取会话
sessionStore.getSession(sessionId)
```

## 配置

**环境变量** (.env):
```
DEEPSEEK_API_KEY=your_api_key_here
PORT=3001
```

**CORS 配置**:
- 允许所有来源 (开发环境)
- 支持 credentials

## 错误处理

所有 API 使用统一响应格式：

```json
{
  "success": true|false,
  "data": {...} | null,
  "error": "error message" | null
}
```

## 服务启动

```bash
cd src/server
node server.js

# 或使用 nodemon 自动重启
npx nodemon server.js
```