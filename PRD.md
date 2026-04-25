# 剧本工坊 (ScriptStudio) — PRD v1.0

> 人设蒸馏 × Agent 对话 × 剧本创作

---

## 1. 产品概述

**产品名：** 剧本工坊（ScriptStudio）
**核心理念：** 每个人设都是一个宇宙，两个人设的碰撞诞生一个故事

**一句话描述：**
用户将角色"蒸馏"为人设资产，选择两个已有的人设并设定场景，让 AI Agent 以这些人设的身份进行对话，最终生成带故事板和视频脚本的对话剧本。

**核心 Slogan：** 两个人设，一个故事

---

## 2. 用户角色与创作分层

### 2.1 一级创作者（人设创作者）

将角色蒸馏成可复用的人设资产。

| 角色 | 描述 | 核心诉求 |
|------|------|---------|
| **普通用户** | 将自己的性格/观点蒸馏成人设 | 留下数字分身，获得他人使用署名 |
| **KOL/网红** | 将自己的公众形象人设化 | IP 变现，授权他人创作 |
| **内容团队** | 批量创建角色人设 | 打造角色库，供创作复用 |

**人设构成要素（实际 v1.0）：**
```
Persona {
  id: string                  // 唯一标识
  name: string                // 人设名称（如"佳宜"）
  avatar: string              // 头像 emoji
  creator: string             // 'user' 或 'system'
  coreView: string            // 核心观点（必填，一段话描述）
  speakingStyle: string       // 说话风格（必填，方言、口头禅、语气特点）
  actionStyle: string         // 行动风格（必填，小动作、习惯性动作、行为模式）
  background: string          // 背景故事（选填）
  imagePrompt: string         // AI生图英文prompt（自动生成）
  imageUrl: string            // AI生图结果URL
  isFavorited: boolean        // 是否收藏
  usageCount: number          // 被使用次数
  likeCount: number           // 被点赞数
  isPublic: boolean           // 是否公开
  isPremium: boolean          // 是否付费
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 2.2 二级创作者（剧本创作者）

使用现成人设进行剧本创作。

| 角色 | 描述 | 核心诉求 |
|------|------|---------|
| **独立创作者** | 热爱故事，想快速生成剧本 | 效率、创意多样性 |
| **AI 视频团队** | 需要剧本素材 | 批量生成、质量稳定 |
| **教育场景** | 用对话剧本做演示/教学 | 自定义场景、角色适配 |

**剧本创作流程：**
```
[选择人设A] + [选择人设B] + [选择场景]
  → 双 LLM Agent 交替对话生成
  → 自动生成故事板（AI生图用）
  → 自动生成视频脚本（AI视频用）
  → 保存剧本
```

---

## 3. 功能清单

| 优先级 | 功能 | 描述 | 状态 |
|--------|------|------|------|
| P0 | **人设创建（AI改写）** | 填表 → AI改写 → 确认三步流程 | ✅ 完成 |
| P0 | **人设广场** | 浏览内置/用户人设，支持搜索、排序、分类筛选（5个Tab） | ✅ 完成 |
| P0 | **人设详情** | 查看人设完整信息，支持直接使用创作剧本 | ✅ 完成 |
| P0 | **场景预设** | 提供预设场景模板 | ✅ 完成 |
| P0 | **剧本生成（双LLM）** | 双 Agent 多轮对话生成 + SSE 实时推送 | ✅ 完成 |
| P0 | **剧本查看** | 故事板/视频脚本/原始对话三 Tab 展示 | ✅ 完成 |
| P0 | **故事板生成** | 对话完成后自动生成故事板（AI生图 prompt） | ✅ 完成 |
| P0 | **视频脚本生成** | 对话完成后自动生成视频 prompt | ✅ 完成 |
| P1 | **收藏功能** | 收藏/取消收藏人设 | ✅ 完成 |
| P1 | **搜索人设** | 按名称和核心观点搜索 | ✅ 完成 |
| P1 | **人设编辑/删除** | 编辑和删除用户创建的人设 | ✅ 完成 |
| P1 | **剧本保存/导出** | 保存到后端 JSON 文件，导出 JSON | ✅ 完成 |
| P1 | **AI 图像生成** | DALL-E 3 图像生成（中文 prompt → 英文翻译） | ✅ 完成 |
| P2 | **AI 创作（视频）** | Seedance/Runway/Pika 视频生成（占位） | ⏳ 预留 |
| P3 | **人设市场** | 付费人设、授权机制 | ❌ 未开始 |

---

## 4. 数据模型（实际代码 v1.0）

### 4.1 人设 Persona

```javascript
// 前端表单 + 后端存储的实际字段
{
  // 基本信息
  id: 'user-1714500000000',           // 自动生成
  name: '佳宜',                        // 必填
  avatar: '👩‍💼',                      // emoji头像
  creator: 'user',                     // 'user' | 'system'

  // 人设核心（四个必填字段）
  coreView: '未来预期是丁克...',         // 核心观点（一段话，非数组）
  speakingStyle: '平时唯唯诺诺...',      // 说话风格
  actionStyle: '被惹怒后会直接扇耳光...', // 行动风格
  background: '985名校毕业...',         // 背景故事（选填）

  // AI 生成
  imagePrompt: 'A 28-year-old Chinese woman...',  // 英文生图prompt
  imageUrl: null,                               // 生图结果URL

  // 收藏状态
  isFavorited: false,

  // 统计数据
  usageCount: 128,
  likeCount: 45,

  // 控制字段
  isPublic: true,
  isPremium: false,
  createdAt: 1745587200000,
  updatedAt: 1745587200000
}
```

### 4.2 剧本 Script

```javascript
{
  id: 'uuid',
  title: 'Dialogue session',           // 自动生成标题
  personaA: {
    id: '佳宜',
    name: '佳宜',
    avatar: '👩‍💼',
    coreView: '...',
    speakingStyle: '...',
    actionStyle: '...',
    background: '...'
  },
  personaB: { /* 同上 */ },
  scene: {
    id: '场景-过年催婚',
    name: '过年催婚',
    description: '家庭聚会...'
  },
  dialogues: [
    { speaker: 'A', content: '...' },
    { speaker: 'B', content: '...' }
  ],
  totalLines: 10,                      // 对话轮数
  wordCount: 850,                      // 总字数
  creator: '当前用户',
  createdAt: 1745587200000,

  // 自动生成的扩展内容
  storyboard: {                        // 故事板 - 用于AI生图
    title: 'Storyboard: ...',
    totalScenes: 4,
    scenes: [{
      id: 1,
      setting: '场景环境描述',
      characters: ['佳宜', '王大妈'],
      action: '角色动作描述',
      dialogue: '关键对白（20字内）',
      emotion: '情绪基调',
      visualPrompt: '英文AI图像生成prompt...'
    }]
  },
  summary: {                           // 视频脚本 - 用于AI视频
    videoPrompt: '英文AI视频生成prompt...',
    duration: '10秒',
    emotion: 'tension',
    style: '电影感'
  }
}
```

### 4.3 Scene（场景）

```javascript
{
  id: '场景-过年催婚',
  name: '过年催婚',
  description: '家庭聚会，亲戚盘问婚姻对象',
  prompt: '场景提示词模板',
  isBuiltIn: true
}
```

---

## 5. 技术架构

### 5.1 系统架构图

```
┌─────────────────────────────────────────────────┐
│                  前端 (React 19 + Vite 6)          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │
│  │ 人设管理│ │ 剧本创作│ │ 人设广场│ │ AI创作页 │ │
│  └────────┘ └────────┘ └────────┘ └──────────┘ │
│         ↕ API (fetch) ↕                          │
├─────────────────────────────────────────────────┤
│            后端 (Express 4.18)                    │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐   │
│  │ 人设 routes│ │ 场景 routes│ │ 剧本 routes      │   │
│  └──────────┘ └──────────┘ └────────────────┘   │
│         ↕                                        │
│  ┌──────────────────────────────────────────┐    │
│  │  Services                                │    │
│  │  ┌────────┐ ┌────────────┐ ┌──────────┐ │    │
│  │  │LLM封装  │ │多轮对话生成│ │故事板生成 │ │    │
│  │  └────────┘ └────────────┘ └──────────┘ │    │
│  └──────────────────────────────────────────┘    │
│         ↕                                        │
│  ┌──────────────────────────────────────────┐    │
│  │  DeepSeek API (双 LLM)                    │    │
│  │  LLM A: deepseek-chat  → Persona A       │    │
│  │  LLM B: deepseek-chat  → Persona B       │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 5.2 双 LLM 多轮对话架构

```
POST /api/scripts/generate-multi
        │
        ▼
createSession(scriptId, {personaA, personaB, scene})
        │
        ▼
queueAndGenerate(scriptId, personaA, personaB, scene, maxRounds=10)
        │
        ▼ (异步后台执行)
┌───────────────────────────────────────────────────┐
│  Round 1: LLM A (deepseek-chat) → Persona A 发言  │
│              ↓ SSE: {event: 'dialogue', speaker:'A'}│
│  Round 2: LLM B (deepseek-chat) → Persona B 发言  │
│              ↓ SSE: {event: 'dialogue', speaker:'B'}│
│  ... 交替进行 ...                                 │
│  终止条件: [END]标记 / 连续短回复 / 达到 maxRounds │
│                                                    │
│  对话完成后（并行）:                                │
│  ├─ summarizeToStoryboard() → storyboard           │
│  └─ summarizeToScriptSummary() → summary           │
│                                                    │
│  completeSession() → SSE: {event: 'done'}          │
└───────────────────────────────────────────────────┘
        │
        ▼
前端 SSE 接收对话  →  保存剧本  →  跳转剧本详情页
```

### 5.3 前端轮询故事板

```
对话完成后（SSE done 事件触发）:
  1. 收到 done 事件 → setIsGeneratingStoryboard(true)
  2. 检查 result.storyboard 和 result.summary 是否存在
  3. 如果不存在，每1秒轮询 GET /api/scripts/:id
  4. 等待 storyboard 和 summary 都生成完毕（最长90秒）
  5. 保存剧本并跳转详情页
```

---

## 6. API 端点完整列表

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| `GET` | `/health` | 健康检查 | - |
| `GET` | `/api/personas/built-in` | 内置人设列表（合并用户统计） | - |
| `GET` | `/api/personas` | 用户创建的人设列表 | - |
| `GET` | `/api/personas/favorites` | 已收藏人设 ID 列表 | - |
| `POST` | `/api/personas` | 创建人设 | `{ name, avatar?, coreView, speakingStyle, actionStyle, background?, isPublic? }` |
| `PUT` | `/api/personas/:id` | 更新人设 | `{ name?, coreView?, ... }` |
| `DELETE` | `/api/personas/:id` | 删除人设 | - |
| `POST` | `/api/personas/generate` | AI 辅助生成人设 | `{ name, personality?, speakingStyle, views?, background? }` |
| `POST` | `/api/personas/:id/like` | 点赞/取消 | `{ action: 'like' \| 'unlike' }` |
| `POST` | `/api/personas/:id/use` | 记录使用次数 | - |
| `GET` | `/api/scenes` | 获取所有场景 | - |
| `GET` | `/api/scripts` | 剧本列表 | - |
| `POST` | `/api/scripts` | 保存剧本 | `{ title, dialogues, personaA, personaB, scene }` |
| `PUT` | `/api/scripts/:id` | 更新剧本 | 任意字段 |
| `DELETE` | `/api/scripts/:id` | 删除剧本 | - |
| `POST` | `/api/scripts/generate` | 单轮 LLM 生成剧本 | `{ personaA, personaB, scene, maxRounds? }` |
| `POST` | `/api/scripts/generate-multi` | 双 LLM 多轮生成 | `{ personaA, personaB, scene, maxRounds? }` |
| `GET` | `/api/scripts/:id` | 轮询生成状态 | - |
| `GET` | `/api/scripts/:id/stream` | SSE 流式实时推送 | - |
| `POST` | `/api/scripts/:id/summarize` | 手动生成故事板 | `{ script: {...} }` |
| `POST` | `/api/scripts/test-dual-llm` | 测试双 LLM 通信 | `{ message? }` |
| `POST` | `/api/ai/generate` | AI 图像/视频生成 | `{ scriptId, type, mode, provider?, persona?, script }` |
| `GET` | `/api/ai/tasks` | 任务列表 | - |
| `GET` | `/api/ai/tasks/:taskId` | 任务状态 | - |
| `POST` | `/api/ai/tasks/:taskId/retry` | 重试失败任务 | - |

---

## 7. 路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 首页（主操作入口 + 最近剧本 + 我的人设） |
| `/persona/create` | PersonaCreatePage | 创建人设（4+1 个必填/选填字段) |
| `/persona/:id` | PersonaDetailPage | 人设详情 + 使用此人设 |
| `/persona/square` | PersonaSquarePage | 人设广场（搜索/Tab筛选/排序） |
| `/script/create` | ScriptCreatePage | 创作剧本（3步流程 + SSE进度） |
| `/script/:id` | ScriptDetailPage | 剧本详情（3个Tab展示） |
| `/ai/create/:scriptId` | AICreatePage | AI 创作（发送至图像/视频工具） |
| `/ai/hub` | AIHubPage | 创作中心（任务管理） |
| `/profile` | ProfilePage | 个人中心 |

---

## 8. 内置数据

### 内置人设（2个）

| 人设 | 核心观点 | 说话风格 | 行动风格 |
|------|---------|---------|---------|
| **佳宜** 👩‍💼 | 丁克、不着急结婚、为自己而活，工作够累了凭什么被婚姻绑架 | 平时客气，被惹怒后毒舌、逻辑碾压 | 被惹怒后扇耳光，不扇肿不停手 |
| **王大妈** 👵 | 养儿防老、不生孩子就是犯罪、女的就是得嫁人 | 浙江杭州方言，三句话不离"不像我家子涵..."，尖酸刻薄阴阳怪气 | 一紧张就放屁，被戳到痛处就脸红，激动时手指戳人 |

### 内置场景（3个）

| 场景 | 描述 |
|------|------|
| **过年催婚** | 家庭聚会催婚连环攻势 |
| **亲戚盘问** | 七大姑八大姨问工资/对象/买房 |
| **工作交接** | 老员工推活给实习生 |

---

## 9. 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥（必填） | - |
| `PORT` | 服务器端口 | `3001` |
| `OPENAI_API_KEY` | OpenAI API 密钥（DALL-E 图像生成） | 回退到 DEEPSEEK_API_KEY |

### LLM 参数

| 服务 | temperature | max_tokens | model | 重试次数 |
|------|------------|------------|-------|---------|
| personaGenerator | 0.7 | 4096 | deepseek-chat | 3次 |
| scriptGenerator | 0.8 | 8192 | deepseek-chat | 3次 |
| multiTurn (LLM A) | 0.8 | 1024 | deepseek-chat | 3次 |
| multiTurn (LLM B) | 0.8 | 1024 | deepseek-chat | 3次 |
| summarizeToStoryboard | 0.7 | 4096 | deepseek-chat | 3次 |
| summarizeToScriptSummary | 0.7 | 1024 | deepseek-chat | 3次 |

---

## 10. 文件持久化

```
src/server/data/
├── built-in-personas.json   # 内置人设（只读）
├── user-personas.json       # 用户创建的人设 + 内置人设的统计记录
├── scenes.json              # 场景列表
├── scripts.json             # 保存的剧本
└── sessions.json            # 生成中的会话（崩溃恢复用）
```

---

## 11. TODO

- [ ] AI 创作 - DALL-E 图像生成实际对接
- [ ] Flux 图像生成 API 对接
- [ ] Seedance/Runway/Pika 视频生成 API 对接
- [ ] 用户认证系统
- [ ] 人设市场（付费/授权）
- [ ] 剧本模板保存
- [ ] 导出更多格式（TXT/Fountain）
- [ ] 示例对话功能在前端表单中的实现

---

**文档版本：** v1.0（基于实际代码 v1.0）
**状态：** 已发布
