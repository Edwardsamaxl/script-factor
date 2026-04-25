# AI 图像/视频生成方案

> 设计用于接收 Seedance (视频) 的生成结果

---

## 1. 概述

用户点击"发送到 AI"按钮后，后端将 prompt 发送给 AI 服务，AI 生成完成后将结果（图片/视频文件）存储到服务器，前端轮询获取并展示。

### 技术选型

- **视频生成**: Doubao-Seedance-1.5-pro (火山引擎 Ark API)
- **图像生成**: DALL-E 3 (OpenAI API) - 作为备选

---

## 2. 存储结构

### 2.1 文件存储 (`public/ai-results/`)

```
public/ai-results/
├── {resultId}/
│   ├── original.jpg          # 原始图片
│   └── original.mp4           # 原始视频
```

### 2.2 元数据存储 (`src/server/data/ai-results.json`)

```json
[
  {
    "id": "ai-result-uuid",
    "scriptId": "script-xxx",
    "scriptTitle": "剧本标题",

    "type": "video",
    "provider": "seedance",
    "mode": "cover",
    "prompt": "英文 prompt 内容",

    "status": "success",
    "resultUrl": "/ai-results/{resultId}/original.mp4",
    "error": null,

    "createdAt": 1745587200000,
    "completedAt": 1745587300000
  }
]
```

### 2.3 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 结果唯一 ID |
| `scriptId` | string | 关联的剧本 ID |
| `scriptTitle` | string | 剧本标题（冗余存储，方便展示） |
| `type` | `image` \| `video` | 结果类型 |
| `provider` | `seedance` \| `dalle` | AI 服务渠道 |
| `mode` | `cover` \| `storyboard` \| `characterA` \| `characterB` | 生成模式 |
| `prompt` | string | 发送给 AI 的英文 prompt |
| `status` | `pending` \| `processing` \| `success` \| `failed` | 状态 |
| `resultUrl` | string | 文件路径（相对于 public） |
| `error` | string \| null | 错误信息 |
| `createdAt` | timestamp | 创建时间 |
| `completedAt` | timestamp \| null | 完成时间 |

---

## 3. API 接口

### 3.1 发起生成任务

```
POST /api/ai/generate
```

**请求体：**

```json
{
  "scriptId": "script-xxx",
  "type": "video",
  "provider": "seedance",
  "mode": "cover",
  "prompt": "英文 prompt"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "resultId": "ai-result-uuid",
    "status": "pending"
  }
}
```

### 3.2 查询结果列表

```
GET /api/ai/results?scriptId={scriptId}
```

### 3.3 查询单个结果

```
GET /api/ai/results/:resultId
```

### 3.4 删除结果

```
DELETE /api/ai/results/:resultId
```

---

## 4. 前端流程

### 4.1 AICreatePage

1. 用户选择 AI 工具 (seedance)
2. 用户选择模式 (cover / storyboard / characterA / characterB)
3. 用户点击"发送到 XXX"
4. 调用 `POST /api/ai/generate` 发起任务
5. 跳转到 AIHubPage

### 4.2 AIHubPage

1. 轮询 `GET /api/ai/results` (每3秒)
2. 展示所有结果卡片
3. 根据 status 显示：
   - `pending` / `processing`: 加载动画
   - `success`: 显示图片/视频
   - `failed`: 显示错误信息 + 重试按钮

---

## 5. 后端流程 (aigcService.js)

### 5.1 Seedance (火山引擎 Ark - 异步任务)

```
1. POST /api/v1/agent/chat/completions  → 获取 taskId
   Body: { model: "Doubao-Seedance-1.5-pro-251215", messages: [...] }
2. 轮询 GET /api/v1/agent/chat/completions/{taskId}  → 直到 completed
3. 下载视频文件到 public/ai-results/{id}/
4. 更新 ai-results.json
```

### 5.2 DALL-E (同步)

```
1. POST /v1/images/generations  → 直接返回图片 URL
2. 下载图片到 public/ai-results/{id}/
3. 更新 ai-results.json
```

---

## 6. 环境变量

```env
# Volcano Engine Ark API (for Seedance)
ARK_API_KEY=ark-59702744-a9f6-484a-94eb-bfaf5b767032-3f6ba
ARK_API_URL=https://ark.volcengineapi.com

# OpenAI API (for DALL-E image generation)
OPENAI_API_KEY=your_openai_key_here
```

---

## 7. 文件改动清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `public/ai-results/` | 新增 | 存储生成文件的目录 |
| `src/server/data/ai-results.json` | 新增 | 元数据存储 |
| `src/server/services/aigcService.js` | 重写 | Seedance + DALL-E 实现 |
| `src/server/routes/aigc.js` | 重写 | 结果查询/删除接口 |
| `src/server/services/dataStore.js` | 扩展 | 添加 ai-results 读写 |
| `src/hooks/useAIResults.js` | 新增 | 前端获取结果的 hook |
| `src/pages/AICreatePage.jsx` | 修改 | 调用后端 API |
| `src/pages/AIHubPage.jsx` | 修改 | 轮询展示结果 |
| `.env` | 修改 | 添加 ARK_API_KEY |

---

## 8. 状态机

```
                    ┌─────────┐
                    │ pending │
                    └────┬────┘
                         │ 任务已提交
                         ▼
                   ┌───────────┐
                   │ processing │
                   └─────┬─────┘
                         │ 完成
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         ┌────────┐  ┌────────┐  ┌────────┐
         │ success│  │ failed │  │ pending│ (重试)
         └────────┘  └────────┘  └────────┘
```
