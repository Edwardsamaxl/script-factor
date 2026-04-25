# 剧本工坊 - 技术文档

## 项目概览

剧本工坊是一个基于 AI 的对话剧本生成系统，支持人设创建、场景设置和多轮对话生成。

## 目录结构

```
src/server/
├── docs/                    # 技术文档
│   ├── README.md            # 本文档
│   ├── TASK1_PROMPTS.md     # Prompt 设计报告
│   ├── TASK2_API.md         # API 服务报告
│   ├── TASK3_DIALOGUE.md    # 对话状态报告
│   ├── TASK4_TEST.md        # 测试调优报告
│   └── TASK5_DATA.md        # 内置数据报告
├── test/                    # 测试文件
│   ├── persona.test.js      # 人设生成测试
│   └── script.test.js       # 剧本生成测试
├── prompts/                 # AI Prompt 模板
│   ├── persona-generation.md
│   ├── script-generation.md
│   └── dialogue-turn.md
├── services/                # 业务逻辑
│   ├── llm.js              # LLM 调用封装
│   ├── personaGenerator.js # 人设生成器
│   ├── scriptGenerator.js  # 剧本生成器
│   ├── multiTurnGenerator.js
│   └── sessionStore.js
├── routes/                  # API 路由
│   ├── personas.js
│   ├── scenes.js
│   ├── scripts.js
│   └── aigc.js
├── data/                    # 内置数据
│   ├── built-in-personas.json
│   └── scenes.json
├── app.js                  # Express 应用
└── server.js               # 服务器入口
```

## 快速开始

### 1. 安装依赖

```bash
cd src/server
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY
```

### 3. 启动服务

```bash
node server.js
```

服务运行在 http://localhost:3001

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/personas/built-in | 获取内置人设列表 |
| POST | /api/personas/generate | 生成新人设 |
| GET | /api/scenes/built-in | 获取内置场景列表 |
| POST | /api/scripts/generate | 生成剧本 |
| POST | /api/aigc/multi-turn | 多轮对话生成 (SSE) |
| GET | /api/aigc/status/:sessionId | 获取会话状态 |

## 测试

### 运行测试

```bash
cd src/server

# 人设生成测试
node test/persona.test.js

# 剧本生成测试
node test/script.test.js
```

### 测试用例

**persona.test.js**:
- Test 1: 完整表单输入
- Test 2: 最小输入 (name + speakingStyle)
- Test 3a: 空字段输入
- Test 3b: 特殊字符输入
- Test 4: 超长文本输入

**script.test.js**:
- Test 1: 基本生成 (8-12 轮对话)
- Test 2: 冲突人设戏剧性
- Test 3: 空场景默认值
- Test 4: 对话递进推进
- Test 5: 自然收尾
- Test 6: 不同 maxRounds 设置

## 技术栈

- **Runtime**: Node.js 22+
- **Framework**: Express 4.18
- **AI Provider**: DeepSeek (OpenAI compatible API)
- **Frontend**: React 19 + React Router 7 + Vite 6

## 内置人设

1. **催婚大妈** - 热络、唠叨、连环追问
2. **反卷青年** - 躺平、丧系、冷幽默
3. **职场老油条** - 圆滑、推活、摸鱼
4. **新人实习生** - 积极、懵懂、背锅侠

## 内置场景

1. **过年催婚** - 家庭聚会催婚攻势
2. **亲戚盘问** - 七大姑八大姨连环追问
3. **工作交接** - 老员工推活给实习生

## 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| DEEPSEEK_API_KEY | DeepSeek API 密钥 | - (必填) |
| PORT | 服务器端口 | 3001 |

### LLM 参数

**personaGenerator**:
- temperature: 0.7
- max_tokens: 4096

**scriptGenerator**:
- temperature: 0.8
- max_tokens: 8192

## 文档索引

- [Task 1: Prompt 设计](./TASK1_PROMPTS.md)
- [Task 2: API 服务](./TASK2_API.md)
- [Task 3: 对话状态管理](./TASK3_DIALOGUE.md)
- [Task 4: 测试调优](./TASK4_TEST.md)
- [Task 5: 内置数据](./TASK5_DATA.md)