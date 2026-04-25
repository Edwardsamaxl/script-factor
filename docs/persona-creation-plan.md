# 人设创建模块重构计划

## 背景

当前人设创建是直接表单 → 保存，数据单薄。为了提升人设质量和后续生图稳定性，需要：
1. 强制 LLM 润色，让人设更丰满
2. 强制生成 imagePrompt，为后续生图做准备

## 目标

- 用户填写表单后，必须经过 LLM 润色才能保存
- 保存时一定包含 imagePrompt
- imageUrl 暂空，等生图功能上线

## 流程

```
┌─────────────────────────────────────────────────────────────┐
│  用户填写表单                                                │
│  (name, coreView, speakingStyle, actionStyle, background)   │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  点击"保存" → 调用 POST /api/personas/rewrite              │
│  (自动触发，无需用户选择)                                    │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  LLM 润色 + 生成 imagePrompt                                │
│  返回预览（含所有字段可编辑）                                │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  用户： [确认]  [取消]                                       │
│  确认 → POST /api/personas 保存                             │
└─────────────────────────────────────────────────────────────┘
```

## API 设计

### POST /api/personas/rewrite

**用途**：LLM 润色 + 生成 imagePrompt

**请求**：
```json
{
  "name": "职场老油条",
  "coreView": "少干少错，不干不错",
  "speakingStyle": "打太极、阴阳怪气",
  "actionStyle": "往后靠、抱胸、意味深长的笑",
  "background": "摸爬滚打多年，秃顶，保温杯不离手"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "name": "职场老油条老张",
    "coreView": "少干少错，不干不错，这是生存智慧。能推就推，能拖就拖，着急你就输了。领导说的都对，但执行要看情况。",
    "speakingStyle": "打太极、绕弯子、阴阳怪气，表面热情实则推脱。开口必称'这个嘛...'，说话慢条斯理却滴水不漏，喜欢用'原则上''理论上'来给自己留余地。",
    "actionStyle": "说话时喜欢往后靠在椅背上，双手抱胸，脸上挂着意味深长的笑。讲到得意处会慢悠悠喝一口保温杯里的枸杞茶，眼神里透着看透一切的淡然。",
    "background": "在国企摸爬滚打二十多年，从基层爬到中层，见过太多风浪。深谙明哲保身之道，推活技术一流。50出头，秃顶但留了一圈'地中海'发型，保温杯从不离手，里面常年泡着枸杞。",
    "imagePrompt": "A 50-something Chinese man with a balding head leaving a fringe around the sides, sitting leisurely in an office chair, leaning back with arms crossed, wearing a casual shirt with sleeves rolled up, holding a thermos in one hand, showing a subtle, knowing smile, warm indoor lighting, modern office background, realistic style"
  }
}
```

### POST /api/personas

**变更**：改为只接收完全确认后的人设数据，不再直接创建

**请求**：
```json
{
  "name": "职场老油条老张",
  "coreView": "...",
  "speakingStyle": "...",
  "actionStyle": "...",
  "background": "...",
  "imagePrompt": "...",
  "isPublic": false
}
```

## 数据结构

### user-personas.json / built-in-personas.json

新增字段：
```json
{
  "imagePrompt": "A 50-something Chinese man...",  // 必填，LLM生成
  "imageUrl": null                                  // 暂空，生图功能上线后填充
}
```

## 文件变更

### 新建文件

| 文件 | 用途 |
|------|------|
| `src/server/prompts/persona-rewrite.md` | LLM 润色 prompt（含 imagePrompt 生成规则） |
| `src/server/services/personaRewriter.js` | 封装 rewrite 逻辑 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/server/routes/personas.js` | 新增 `/rewrite` 接口，修改 `/` POST 逻辑 |
| `src/server/data/user-personas.json` | 新增 `imagePrompt` 字段 |
| `src/server/data/built-in-personas.json` | 新增 `imagePrompt` 字段（可为空） |

## LLM Prompt 设计 (persona-rewrite.md)

### 输入
用户填写的原始表单数据

### 输出
润色后的人设 + imagePrompt

### 润色规则
1. **name**：如果太短或太普通，进行扩展
2. **coreView**：保持核心观点，但润色表达
3. **speakingStyle**：展开细节（语气、词汇、习惯用语、口癖）
4. **actionStyle**：展开细节（肢体语言、表情习惯、常用动作）
5. **background**：补充完整，2-3句话

### imagePrompt 生成规则
1. 从人设推断外貌特征：年龄、性别、发型、脸型、体态、穿着风格
2. 提取 actionStyle 中的肢体特征
3. 从 background 提取职业相关特征（如制服、工作环境）
4. 指定风格：realistic, detailed, expressive
5. 指定光线和背景：warm indoor lighting, outdoor 等
6. 避免抽象描述，使用具体可画的细节

### imagePrompt 模板
```
[年龄] [性别] [种族/地区] [外貌描述],
[发型/脸型],
[穿着描述],
[姿态/动作],
[表情],
[背景环境],
[风格]
```

## 前端变更（待后续）

本次仅实现后端 API，前端后续接入。

## 后续扩展

### 生图接口（生图功能上线后）
```
POST /api/personas/:id/generate-image
```
- 调用 aigcService.generateImage(imagePrompt)
- 保存图片到 `src/server/data/personas-images/{id}.png`
- 更新 persona 的 imageUrl

### 详情页展示
- 生图功能上线后，展示 imageUrl 对应的图片

## 实现顺序

1. [ ] 新建 `persona-rewrite.md` prompt 文件
2. [ ] 新建 `personaRewriter.js` service
3. [ ] 修改 `routes/personas.js` 添加 `/rewrite` 接口
4. [ ] 更新 `user-personas.json` 数据结构（加 imagePrompt）
5. [ ] 更新 `built-in-personas.json` 数据结构（加 imagePrompt）
6. [ ] 测试 API 流程
