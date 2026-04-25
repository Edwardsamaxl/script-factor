# Task 1: Prompt 设计报告

## 概述

Task 1 完成了剧本工坊项目的人设生成、剧本生成和多轮对话的 Prompt 设计。

## Prompt 文件结构

```
prompts/
├── persona-generation.md   # 人设生成 Prompt
├── script-generation.md     # 剧本生成 Prompt (单轮版本)
└── dialogue-turn.md         # 多轮对话生成 Prompt
```

## 1. persona-generation.md

**用途**: 根据用户输入生成完整人设 JSON

**输入字段**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | Yes | 人设名称 |
| personality | string[] | Yes | 性格标签 |
| speakingStyle | string | Yes | 说话风格 |
| views | string[] | Yes | 核心观点 |
| background | string | No | 背景故事 |
| exampleDialogs | Dialog[] | No | 示例对话 |

**输出格式**: Persona JSON 对象，符合 PRD 数据模型

**Generation Guidelines**:
1. Name Generation - 短昵称扩展为完整名称
2. Personality Expansion - 性格标签扩展为连贯描述
3. Speaking Style Elaboration - 详细描述（语气、词汇、习惯表达）
4. Views Development - 确保观点有争议性、可信、独特、可辩论
5. Background Story - 如未提供则自动生成（2-3句）
6. Example Dialogs - 生成 2-3 个展示人设的示例对话

**Quality Checklist**:
- [ ] Name is complete and vivid
- [ ] Personality tags are cohesive and self-consistent
- [ ] Speaking style is distinctive and recognizable
- [ ] Views are interesting, debatable, and consistent with personality
- [ ] Background logically supports the persona
- [ ] Example dialogs authentically reflect the character
- [ ] Output is valid JSON conforming to the schema

## 2. script-generation.md

**用途**: 基于人设和场景生成完整剧本（单轮调用版本）

**输入参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| personaA | Persona JSON | Yes | 第一个人设 |
| personaB | Persona JSON | Yes | 第二个人设 |
| scene | Scene JSON | Yes | 场景上下文 |
| maxRounds | number | No | 最大轮数 (默认 8-12) |

**输出格式**: Script JSON 对象

```json
{
  "title": "剧本标题",
  "personaA": { "id": "...", "name": "..." },
  "personaB": { "id": "...", "name": "..." },
  "scene": { "id": "...", "name": "..." },
  "dialogues": [
    { "speaker": "A", "content": "...", "emotion": "..." }
  ],
  "totalLines": 10,
  "wordCount": 850
}
```

**Dialogue Guidelines**:
1. Title Creation - 5-15 字符，体现冲突和场景
2. Dialogue Structure - 8-12 轮，A→B→A→B 交替
3. Content Requirements - 反映人设、保持观点、流畅自然、制造张力
4. Natural Ending - 达到轮数/共识/高潮/优雅分歧
5. Dramatic Arc - Opening → Rising → Climax → Resolution

**Quality Checklist**:
- [ ] Title is catchy and relevant
- [ ] Each dialogue reflects the correct persona's character
- [ ] Speaking styles are distinct and recognizable
- [ ] Views collide in an interesting/dramatic way
- [ ] Dialogue has natural flow and rhythm
- [ ] Emotional arc builds appropriately
- [ ] Ending feels natural and satisfying
- [ ] Word count per line is within 50-150 characters
- [ ] Output is valid JSON conforming to the schema

## 3. dialogue-turn.md

**用途**: 多轮对话的追加生成（流式输出）

**输入参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| history | Dialogue[] | Yes | 对话历史 |
| currentSpeaker | string | Yes | 当前说话者 (A/B) |
| speakerPersona | Persona JSON | Yes | 说话人人设 |
| listenerPersona | Persona JSON | Yes | 听者人设 |
| scene | Scene JSON | Yes | 场景上下文 |

**输出格式**: 单条对话 JSON

```json
{
  "speaker": "A",
  "content": "对话内容...",
  "emotion": "可选的情绪标注"
}
```

## 服务配置

### personaGenerator.js

```javascript
const response = await callClaudeWithSystem(promptTemplate, userMessage, {
  temperature: 0.7,
  max_tokens: 4096
});
```

### scriptGenerator.js

```javascript
const response = await callClaudeWithSystem(promptTemplate, userMessage, {
  temperature: 0.8,
  max_tokens: 8192
});
```

## 设计决策

1. **单轮 vs 多轮**: 剧本生成使用单轮调用生成完整剧本，便于控制质量和一致性
2. **流式输出**: 多轮对话通过追加模式实现流式输出（SSE）
3. **人设分离**: 人设和剧本生成分离，便于复用和测试
4. **JSON 输出**: 所有输出强制为 JSON 格式，便于前端处理