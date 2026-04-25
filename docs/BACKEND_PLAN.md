# 后端开发计划表

## 目标
独立完成人设生成和剧本生成的后端逻辑，支持前端对接。

---

## 阶段一：Prompt 设计 & 本地测试（1-2天）

### 1.1 人设生成 Prompt

**任务**：设计 prompt，把用户填写的表单数据转换成 persona JSON

**输入字段**：
```
- name: string
- personality: string[] (性格标签)
- speakingStyle: string (说话风格描述)
- views: string[] (核心观点)
- background?: string (背景故事)
- exampleDialogs?: Dialog[] (示例对话)
```

**输出格式**：Persona JSON（同 PRD 定义）

**测试用例**：
- [ ] 测试1：普通用户填写的简单表单
- [ ] 测试2：填写不完整（缺背景故事）
- [ ] 测试3：极端输入（太长/太短）

**交付物**：`prompts/persona-generation.md`

---

### 1.2 剧本生成 Prompt（单次调用版）

**任务**：设计 prompt，一次性生成完整对话剧本

**输入**：
```
- personaA: Persona JSON
- personaB: Persona JSON
- scene: Scene JSON
- maxRounds: number (默认8-12)
```

**输出格式**：
```json
{
  "title": "剧本标题",
  "dialogues": [
    {"speaker": "A", "content": "..."},
    {"speaker": "B", "content": "..."}
  ]
}
```

**交付物**：`prompts/script-generation.md`

---

### 1.3 多轮对话 Prompt（方案B）

**任务**：设计每轮对话的 prompt 模板

**单轮输入**：
```
- 当前发言者 persona
- 对手 persona
- 对话历史（array of {speaker, content}）
- 场景描述
- 当前轮次
```

**输出**：该角色的下一句发言（string）

**关键点**：
- 需要知道何时结束对话（自然收尾判断）
- 需要保持对话推进感，不是重复观点

**交付物**：`prompts/dialogue-turn.md`

---

## 阶段二：API 服务搭建（1-2天）

### 2.1 项目初始化

```
npm init
npm install express cors
npm install @anthropic-ai/sdk  (或其他LLM SDK)
```

**目录结构**：
```
src/
├── routes/
│   ├── personas.js      # 人设相关接口
│   ├── scripts.js       # 剧本相关接口
│   └── scenes.js        # 场景相关接口
├── services/
│   ├── llm.js           # LLM 调用封装
│   ├── personaGenerator.js   # 人设生成逻辑
│   └── scriptGenerator.js   # 剧本生成逻辑
├── prompts/
│   ├── persona-generation.md
│   ├── script-generation.md
│   └── dialogue-turn.md
├── data/
│   ├── built-in-personas.json   # 内置人设
│   └── scenes.json             # 内置场景
├── app.js
└── server.js
```

---

### 2.2 内置数据

> **主题贴合**：基于黑客松主题（过年、实习生、妆容）设计，演示效果最优组合为"催婚大妈 vs 反卷青年"

**内置人设（4个）**：

| 人设 | 性格 | 说话风格 | 贴合主题 |
|------|------|---------|---------|
| 催婚大妈 | 热络、控制型、爱打听 | 直接、曲里拐弯、唠叨 | 过年 |
| 反卷青年 | 躺平、丧、不屑 | 敷衍、怼人、冷幽默 | 过年 |
| 职场老油条 | 圆滑、推活、摸鱼 | 打太极、绕弯子、阴阳怪气 | 实习生 |
| 新人实习生 | 积极、懵懂、背锅侠 | 客气、认真、偶尔耿直 | 实习生 |

**内置场景（3个）**：

| 场景 | 描述 | 贴合主题 |
|------|-----|---------|
| 过年催婚 | 家庭聚会，亲戚盘问婚姻对象 | 过年 |
| 亲戚盘问 | 七大姑八大姨问工资/对象/买房 | 过年 |
| 工作交接 | 老员工推活给实习生，实习生一脸懵 | 实习生 |

**交付物**：`data/built-in-personas.json`, `data/scenes.json`

**交付物**：`data/built-in-personas.json`, `data/scenes.json`

---

### 2.3 API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/personas/generate` | POST | 从表单数据生成人设 |
| `/api/personas/built-in` | GET | 获取内置人设列表 |
| `/api/scenes` | GET | 获取内置场景列表 |
| `/api/scripts/generate` | POST | 单次生成剧本（方案A） |
| `/api/scripts/generate-multi` | POST | 多轮生成剧本（方案B） |
| `/api/scripts/:id` | GET | 获取剧本结果 |

**POST /api/scripts/generate-multi 请求体**：
```json
{
  "personaA": {...},
  "personaB": {...},
  "scene": {...},
  "maxRounds": 10
}
```

**响应**（轮询模式）：
```json
{
  "scriptId": "uuid",
  "status": "generating" | "completed" | "failed",
  "progress": 0.3,
  "result": null  // 完成前为 null
}
```

---

## 阶段三：对话状态管理（1天）

### 3.1 方案A：简单轮询

```
前端 POST /api/scripts/generate-multi
    ↓
服务端创建 session，启动生成
    ↓
每次轮询 GET /api/scripts/:id
    ↓
返回 { status, progress, result }
```

**存储**：内存 Map 或简单 JSON 文件

---

### 3.2 方案B：Server-Sent Events（SSE）

如果想要更好的实时体验：

```
前端请求 GET /api/scripts/:id/stream
    ↓
服务端流式返回：
  event: progress
  data: {"round": 3, "total": 10}

  event: dialogue
  data: {"speaker": "A", "content": "..."}

  event: done
  data: {"scriptId": "..."}
```

---

### 3.3 对话轮次控制

```javascript
// 控制逻辑
const MAX_ROUNDS = 10
const STOP_PROBABILITY = 0.1  // 每轮有10%概率自然结束

// 结束条件：
// 1. 达到 MAX_ROUNDS
// 2. 连续两轮都是简短回复（<20字）
// 3. LLM 返回 [END] 标记
// 4. 随机提前结束（模拟自然聊天）
```

---

## 阶段四：测试 & 调优（1天）

### 4.1 本地测试用例

**人设生成测试**：
- [ ] 输入完整表单 → 输出有效 JSON
- [ ] 输入只有 name + speakingStyle → 能否合理补全
- [ ] 极端输入（空字段、特殊字符）

**剧本生成测试（方案A）**：
- [ ] 两个人设 + 场景 → 生成8-12轮对话
- [ ] 两个人设冲突（毒舌 vs 佛系）→ 有戏剧性
- [ ] 场景空白 → 有合理默认值

**剧本生成测试（方案B）**：
- [ ] 10轮对话是否有递进/推进
- [ ] 是否出现重复观点
- [ ] 是否自然收尾

### 4.2 调优

- prompt 迭代优化
- 参数调整（temperature, max_tokens）
- 错误处理完善

---

## 交付物清单

| 阶段 | 交付物 | 状态 |
|------|--------|------|
| 1 | `prompts/persona-generation.md` |  |
| 1 | `prompts/script-generation.md` |  |
| 1 | `prompts/dialogue-turn.md` |  |
| 2 | `src/app.js` + 路由 + 服务 |  |
| 2 | `data/built-in-personas.json` |  |
| 2 | `data/scenes.json` |  |
| 3 | 对话状态管理逻辑 |  |
| 4 | 本地测试通过 |  |

---

## 时间估算

| 阶段 | 预计时间 | 可并行 |
|------|---------|--------|
| 阶段一：Prompt设计 | 1-2天 | ✅ 与前端并行 |
| 阶段二：API服务 | 1-2天 | ✅ 与前端并行 |
| 阶段三：状态管理 | 1天 | ❌ 依赖阶段二 |
| 阶段四：测试调优 | 1天 | ✅ 可最后做 |

**总计：3-4天**（可与前端同期完成）

---

## 前置依赖

- [ ] 确认 LLM API（Claude / GPT）和 API key
- [ ] 确认前端技术栈（是否同语言？直接 HTTP 调用还是 SDK？）
- [ ] 确认部署环境（本地开发 / 云服务器 / Serverless）
