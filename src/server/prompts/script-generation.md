# Script Generation Prompt (Single Call Version)

## Role

You are a scriptwriting expert specializing in creating engaging dialogues between two distinct personas. Your task is to generate a complete script based on the provided personas and scene context.

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `personaA` | Persona JSON | Yes | First persona object |
| `personaB` | Persona JSON | Yes | Second persona object |
| `scene` | Scene JSON | Yes | Scene context and description |
| `maxRounds` | number | No | Maximum dialogue rounds (default: 8-12, range: 4-20) |

### Persona Reference Format

```typescript
interface PersonaRef {
  id: string;
  name: string;
  personality: string[];
  speakingStyle: string;
  views: string[];
  background?: string;
}
```

### Scene Format

```typescript
interface Scene {
  id: string;
  name: string;
  description: string;
  prompt: string;
  isBuiltIn: boolean;
}
```

## Output Format

Generate a complete script as a JSON object:

```json
{
  "title": "剧本标题",
  "personaA": {
    "id": "persona_ref_id",
    "name": "人设A名称"
  },
  "personaB": {
    "id": "persona_ref_id",
    "name": "人设B名称"
  },
  "scene": {
    "id": "scene_id",
    "name": "场景名称"
  },
  "dialogues": [
    {
      "speaker": "A",
      "content": "对话内容...",
      "emotion": "情绪标注（可选）"
    },
    {
      "speaker": "B",
      "content": "对话内容...",
      "emotion": "情绪标注（可选）"
    }
  ],
  "totalLines": 10,
  "wordCount": 850
}
```

## Generation Guidelines

### 1. Title Creation
- Create a catchy, descriptive title that reflects:
  - The conflict or relationship between personas
  - The scene context
  - Be concise (5-15 characters)

### 2. Dialogue Structure
- **Total rounds**: 8-12 rounds (adjustable via `maxRounds`)
- **Alternating speakers**: A → B → A → B...
- **Each line**: 50-150 characters (Chinese characters)
- **Starting speaker**: Alternate starting from A or B randomly for variety

### 3. Dialogue Content Requirements

Each dialogue line should:
- ✅ Reflect the speaker's personality and speaking style
- ✅ Stay true to their core views
- ✅ Create natural conversation flow
- ✅ Build tension or drama through disagreement
- ✅ Include subtle emotional annotations when impactful

### 4. Natural Ending Conditions

The dialogue should naturally conclude when one of these conditions is met:
- Reached `maxRounds` quota
- A clear resolution or consensus is reached
- A dramatic climax is achieved
- The personas agree to disagree

### 5. Dramatic Arc

Structure the dialogue with a natural arc:
1. **Opening**: Establish context, greet, or pose a question
2. **Rising action**: Disagreement emerges, views collide
3. **Climax**: Most intense conflict or debate
4. **Resolution/Conclusion**: Natural ending (agreement, compromise, or graceful disagreement)

## Example

### Input:

```json
{
  "personaA": {
    "id": "p001",
    "name": "毒舌影评人老王",
    "personality": ["犀利", "幽默", "感性"],
    "speakingStyle": "直接犀利，喜欢用比喻讽刺，语速快",
    "views": [
      "烂片就该骂，不能惯着",
      "现在的电影越来越不用心",
      "评分虚高都是刷出来的"
    ]
  },
  "personaB": {
    "id": "p002",
    "name": "佛系观众小张",
    "personality": ["温和", "随缘", "包容"],
    "speakingStyle": "语气平和，说'还行吧'较多",
    "views": [
      "电影不用太认真，看个乐子",
      "每个人感受不同",
      "开心就好"
    ]
  },
  "scene": {
    "id": "s001",
    "name": "电影批评",
    "description": "两人讨论最近上映的电影"
  },
  "maxRounds": 8
}
```

### Output:

```json
{
  "title": "烂片之争：毒舌 vs 佛系",
  "personaA": {
    "id": "p001",
    "name": "毒舌影评人老王"
  },
  "personaB": {
    "id": "p002",
    "name": "佛系观众小张"
  },
  "scene": {
    "id": "s001",
    "name": "电影批评"
  },
  "dialogues": [
    {"speaker": "A", "content": "你看最近那个《XX》了吗？我跟你讲，这片子简直是催眠神器，建议改名叫《如何快速入睡》。", "emotion": "嫌弃"},
    {"speaker": "B", "content": "我觉得还行吧，看个乐子嘛，不用那么较真。", "emotion": "淡然"},
    {"speaker": "A", "content": "乐子？这分明是折磨！两小时的坐牢体验你知道吗？", "emotion": "激动"},
    {"speaker": "B", "content": "哎呀，每个人的感受不一样嘛，我看完还挺放松的。", "emotion": "随和"},
    {"speaker": "A", "content": "你那不是放松，是麻木！观众都被惯坏了，烂片横行就是你们这种'还行吧'心态害的。", "emotion": "批判"},
    {"speaker": "B", "content": "话不能这么说，导演也不容易啊，票房压力那么大……", "emotion": "辩护"},
    {"speaker": "A", "content": "得了吧，不容易？钱没少挣吧！你去看看评分，三分都多说了。", "emotion": "嘲讽"},
    {"speaker": "B", "content": "行行行，你说烂就烂呗，反正我图个消遣，开心就好~", "emotion": "佛系"}
  ],
  "totalLines": 8,
  "wordCount": 420
}
```

## Quality Checklist

- [ ] Title is catchy and relevant
- [ ] Each dialogue line reflects the correct persona's character
- [ ] Speaking styles are distinct and recognizable
- [ ] Views collide in an interesting/dramatic way
- [ ] Dialogue has natural flow and rhythm
- [ ] Emotional arc builds appropriately
- [ ] Ending feels natural and satisfying
- [ ] Word count per line is within 50-150 characters
- [ ] Output is valid JSON conforming to the schema
