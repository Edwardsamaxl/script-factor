# Task #3 完成报告

## 创建/修改的文件

### 1. `E:\CursorProject\script-factor\src\server\services\sessionStore.js` (新建)

内存会话存储服务，实现会话管理功能：
- 使用 `Map` 存储会话：`sessions`
- 使用 `Map` 存储队列：`generationQueues`
- 会话结构：`{ id, status: 'generating'|'completed'|'failed', dialogues: [], progress: 0, error?: string }`

关键代码：
```javascript
const sessions = new Map();
const generationQueues = new Map();

function createSession(id) {
  const session = {
    id,
    status: 'generating',
    dialogues: [],
    progress: 0,
    error: null
  };
  sessions.set(id, session);
  return session;
}

function addDialogue(id, dialogue) {
  const session = sessions.get(id);
  if (session) {
    session.dialogues.push(dialogue);
    session.progress = Math.round((session.dialogues.length / 10) * 100);
  }
}
```

### 2. `E:\CursorProject\script-factor\src\server\services\multiTurnGenerator.js` (新建)

多轮对话生成逻辑：

关键代码：
```javascript
const MAX_ROUNDS = 10;
const SHORT_RESPONSE_THRESHOLD = 20;

async function generateMultiTurn(scriptId, personaA, personaB, scene, maxRounds = MAX_ROUNDS, onEvent) {
  for (let round = 1; round <= effectiveMaxRounds; round++) {
    const current = round % 2 === 1 ? personaA : personaB;
    const opponent = round % 2 === 1 ? personaB : personaA;
    const history = dialogues.map(d => ({ speaker: d.speaker, content: d.content }));

    const line = await callLMDialogue(current, opponent, history, scene, round);

    if (shouldEndDialogue(line, round, dialogues)) break;

    dialogues.push({ speaker: round % 2 === 1 ? 'A' : 'B', content: line });
    addDialogue(scriptId, dialogues[dialogues.length - 1]);
    onEvent('dialogue', { speaker: dialogues[ dialogues.length-1 ].speaker, content: line });
  }
}

function shouldEndDialogue(line, round, dialogues) {
  if (line === '[END]') return true;
  if (round <= 2) return false;
  if (line.length < SHORT_RESPONSE_THRESHOLD) {
    const prev = dialogues[dialogues.length - 1];
    if (prev && prev.content.length < SHORT_RESPONSE_THRESHOLD) return true;
  }
  return false;
}
```

### 3. `E:\CursorProject\script-factor\src\server\routes\scripts.js` (扩展)

添加了三个新端点：

#### POST /api/scripts/generate-multi - 启动多轮对话生成
```javascript
router.post('/generate-multi', async (req, res) => {
  const scriptId = crypto.randomUUID();
  createSession(scriptId);
  queueAndGenerate(scriptId, personaA, personaB, scene, rounds, () => {});
  res.json({ scriptId, status: 'generating', progress: 0 });
});
```

#### GET /api/scripts/:id - 轮询获取状态
```javascript
router.get('/:id', async (req, res) => {
  const session = getSession(id);
  res.json({
    scriptId: session.id,
    status: session.status,
    progress: session.progress,
    result: session.status === 'completed' ? { dialogues: session.dialogues } : null
  });
});
```

#### GET /api/scripts/:id/stream - SSE流式输出
```javascript
router.get('/:id/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const intervalId = setInterval(() => {
    // 发送 dialogue, progress, done, error 事件
  }, 500);

  req.on('close', () => clearInterval(intervalId));
});
```

---

## 实现的功能

1. **内存会话存储** - 使用 Map 存储会话状态，支持多会话并发
2. **多轮对话生成** - AB角色交替对话，调用LLM逐轮生成
3. **自然收尾判断** - 三种结束条件：LLM返回[END]、达到MAX_ROUNDS(10)、连续两轮简短回复(<20字)
4. **并发控制** - 同一scriptId的请求排队处理，使用Promise实现
5. **轮询模式** - GET /api/scripts/:id 返回会话状态
6. **SSE流式输出** - GET /api/scripts/:id/stream 流式推送 events

### SSE事件格式
```
event: connected, data: {}
event: progress, data: {"round":1,"total":10}
event: dialogue, data: {"speaker":"A","content":"..."}
event: done, data: {"scriptId":"...","result":{...}}
event: error, data: {"message":"..."}
```

---

## 遇到的问题
- 无重大问题，实现顺利

---

## 验证情况
- 代码结构完整，逻辑清晰
- 使用现有的 `llm.js` 中的 `callClaudeWithSystem` 函数
- 路由配置遵循现有风格
- Session Store 使用模块级 Map，持久化在内存中
