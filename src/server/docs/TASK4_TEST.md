# Task 4: 测试调优报告

## 测试文件结构

```
src/server/
├── test/
│   ├── persona.test.js   # 人设生成测试
│   └── script.test.js     # 剧本生成测试
└── docs/
    └── TASK4_TEST.md      # 本报告
```

## 测试用例设计

### persona.test.js - 人设生成测试

| 测试编号 | 测试名称 | 测试内容 | 预期结果 |
|---------|---------|---------|---------|
| Test 1 | Complete Input | 完整表单输入 | 输出有效 JSON，人设名称自然扩展 |
| Test 2 | Minimal Input | 仅 name + speakingStyle | 自动补全 personality 和 views |
| Test 3a | Empty Fields | 空字段输入 | 使用默认值生成有效人设 |
| Test 3b | Special Characters | 特殊字符输入 | 正确处理转义字符 |
| Test 4 | Extreme Long Input | 超长文本输入 | 正确处理并生成合理人设 |

### script.test.js - 剧本生成测试

| 测试编号 | 测试名称 | 测试内容 | 预期结果 |
|---------|---------|---------|---------|
| Test 1 | Basic Generation | 两个人设 + 场景 | 生成 8-12 轮对话 |
| Test 2 | Conflict Personas | 冲突人设（催婚大妈 vs 反卷青年） | 有戏剧性冲突 |
| Test 3 | Empty Scene | 空场景 | 有合理默认值 |
| Test 4 | Dialogue Progression | 多轮对话递进 | 对话有推进感 |
| Test 5 | Natural Ending | 自然收尾 | 有收尾感 |
| Test 6 | Different MaxRounds | 不同 maxRounds 设置 | 生成相应轮数 |

## 测试执行

### 前置条件

```bash
# 1. 复制环境变量文件
cp src/server/.env.example src/server/.env

# 2. 编辑 .env，填入 DEEPSEEK_API_KEY
```

### 运行测试

```bash
# 人设生成测试
cd src/server
node test/persona.test.js

# 剧本生成测试
node test/script.test.js
```

## 参数配置

### personaGenerator.js

```javascript
{
  temperature: 0.7,
  max_tokens: 4096
}
```

### scriptGenerator.js

```javascript
{
  temperature: 0.8,
  max_tokens: 8192
}
```

## 调优建议

### 1. Temperature 调整

- `personaGenerator`: 0.7 适用于创意生成，偏低可能导致输出过于保守
- `scriptGenerator`: 0.8 适用于对话生成，戏剧性需要更高随机性

### 2. Max Tokens 调整

- `personaGenerator`: 4096 足够生成单个人设
- `scriptGenerator`: 8192 确保能生成完整的 8-12 轮对话

### 3. Prompt 优化建议

#### Persona Generation

1. 增加示例数量：从 2 个增加到 3-5 个
2. 明确输出格式：使用更严格的 JSON Schema
3. 增加质量检查清单项

#### Script Generation

1. 增加对话长度指导：每行 50-150 中文字符
2. 明确情绪标注的使用场景
3. 增加冲突升级的引导

## 发现的问题

### 待验证问题

1. 需要有效的 `DEEPSEEK_API_KEY` 才能运行 LLM 调用测试
2. 当前无法验证实际输出是否满足预期格式

### 预期行为

- 空字段输入应该使用默认值补全
- 特殊字符应该正确转义
- 超长输入应该被截断或合理处理

## 测试状态

| 测试组 | 状态 | 说明 |
|-------|------|-----|
| persona.test.js | 待运行 | 需要 DEEPSEEK_API_KEY |
| script.test.js | 待运行 | 需要 DEEPSEEK_API_KEY |

## 运行结果记录

（待 API Key 配置完成后更新）