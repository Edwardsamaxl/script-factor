# Task 3: 对话状态管理报告

## 概述

Task 3 完成了对话状态管理、轮询机制和 SSE 流式输出。

## 实现组件

### 1. sessionStore.js - 会话状态存储

**功能**:
- 会话创建、更新、完成
- 对话历史管理
- 进度追踪

**核心 API**:
```javascript
class SessionStore {
  // 创建新会话
  createSession(data)

  // 获取会话
  getSession(sessionId)

  // 更新会话进度
  updateProgress(sessionId, dialogue)

  // 完成会话
  completeSession(sessionId, summary)

  // 清理过期会话
  cleanup()
}
```

**会话数据结构**:
```javascript
{
  sessionId: string,
  status: 'pending' | 'generating' | 'completed' | 'failed',
  progress: { current: number, total: number },
  dialogues: Array<Dialogue>,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. multiTurnGenerator.js - 多轮对话生成器

**功能**:
- 基于已有对话历史追加新对话
- 使用 dialogue-turn.md prompt
- 支持流式输出

**核心函数**:
```javascript
async function generateDialogueTurn({ history, currentSpeaker, ... })
async function* generateDialogueStream({ personaA, personaB, scene, maxRounds })
```

### 3. aigc.js - AI 生成路由

**端点**:
- `POST /api/aigc/multi-turn` - 流式多轮生成
- `GET /api/aigc/status/:sessionId` - 轮询状态

**SSE 格式**:
```javascript
// 对话数据
data: {"speaker":"A","content":"...","emotion":"..."}

// 进行中
data: {"done":false}

// 完成
data: {"done":true,"summary":{"totalLines":10,"wordCount":850}}
```

## 轮询机制

客户端通过定期请求 `/api/aigc/status/:sessionId` 获取进度：

```javascript
async function pollSessionStatus(sessionId, interval = 1000) {
  while (true) {
    const response = await fetch(`/api/aigc/status/${sessionId}`);
    const { data } = await response.json();

    if (data.status === 'completed' || data.status === 'failed') {
      break;
    }

    // 更新 UI
    updateProgress(data.progress);

    await sleep(interval);
  }
}
```

## 流式输出 vs 轮询

| 方式 | 优点 | 缺点 |
|------|------|------|
| SSE 流式 | 实时、低延迟 | 需要保持连接 |
| 轮询 | 简单、兼容性好 | 有延迟、服务器负载 |

**选择**: 当前实现支持两种方式，SSE 为主要推荐。

## 对话状态机

```
[pending] → [generating] → [completed]
                 ↓
              [failed]
```

### 状态转换

1. **pending**: 会话创建，等待开始生成
2. **generating**: 正在生成对话
3. **completed**: 生成完成
4. **failed**: 生成失败

## 进度计算

```javascript
progress = {
  current: dialogues.length,
  total: maxRounds
}
```

## 对话格式

```typescript
interface Dialogue {
  speaker: 'A' | 'B';
  content: string;
  emotion?: string;
  timestamp?: number;
}
```

## 多轮对话 Prompt

使用 `prompts/dialogue-turn.md`，每次生成一条对话：

**输入**:
- history: 对话历史
- currentSpeaker: 当前说话者
- speakerPersona: 说话人人设
- listenerPersona: 听者人设
- scene: 场景

**输出**:
```json
{
  "speaker": "A",
  "content": "对话内容...",
  "emotion": "情绪标注"
}
```

## 并发控制

- 每个会话独立生成
- 使用 sessionId 隔离
- 避免生成冲突

## 内存管理

- SessionStore 使用 Map 存储
- 定期清理过期会话 (cleanup 方法)
- 默认过期时间: 30 分钟