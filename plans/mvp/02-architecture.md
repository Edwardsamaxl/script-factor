# Phase 2 — 架构设计

> 目标：**拍板技术方案**，输出系统设计图和 TASKS.md
> 时机：黑客松开场 1-4 小时
>
> **💡 Team 提醒**：考虑启动 `/team research-and-design` — researcher 调研，designer 出设计文档，链式执行。

---



---

## 核心产出

- [ ] 系统设计图（含数据流）
- [ ] TASKS.md 按优先级排序
- [ ] 第一个功能分支已从 main 切出

---

## 技术选型三问（15 分钟）

```
Q1: 用什么前端框架？
→ 选最熟的，不学新框架
→ 推荐：Next.js 14 App Router
→ 备选：React + Vite

Q2: 用什么后端？
→ FastAPI + SQLAlchemy + MySQL（traffic-defect-detection 已在用）
→ AI 场景加：LangGraph + Qdrant

Q3: AI 能力怎么集成？
→ 选一个主力模型，不要混用
→ 推荐：Claude API / MiniMax-M2.7
→ CV 推理：Modal / Railway GPU
```

### 场景选型表

| MVP 场景 | 前端 | 后端 | 数据库 | 向量 | AI Provider |
|---------|------|------|--------|------|------------|
| **RAG + 对话** | Next.js | FastAPI | MySQL | Qdrant | Claude / MiniMax |
| **CV 检测** | Next.js | FastAPI | MySQL | — | YOLOv8 (Modal) |
| **多模态 Agent** | Next.js | FastAPI | MySQL + Redis | Qdrant | Claude Vision |

---

## 系统设计图（30 分钟）

**工具**：Excalidraw（手画，5 分钟出图）

必须包含：
1. 用户交互流程 — 打开到完成目标的每一步
2. 数据流 — 从哪来、经什么处理、存到哪
3. 外部依赖 — 第三方 API、AI 模型、SaaS
4. MVP 边界 — 明确 MVP **不做**的

### RAG 场景数据流

```
用户提问
    │
    ▼
FastAPI Backend
├── AgentRouter（路由：简单/复杂）
│   ├── ReAct LangGraph
│   │   └── Retriever（Qdrant + BM25 + embedding）
│   └── Coordinator 任务分解 → Workers 并行 → Synthesizer
├── Reranker（BGE CrossEncoder）: Top-K → Top-3
└── LLM Generator（Claude API）→ 返回回答 + 引用来源
    │
    ▼
Next.js 前端（流式输出）
```

### CV 检测场景数据流

```
图片上传 → FastAPI → YOLOv8 推理（Modal GPU）
    → 可视化标注 → MySQL 存储检测记录
    → Next.js 前端展示结果
```

---

## TASKS.md 模板

```markdown
## TASKS.md — [项目名]

### P0 — 必须完成（不可展示则项目无意义）

- [ ] [T-001] 后端骨架启动，API 可访问
- [ ] [T-002] 数据库模型 + 迁移完成
- [ ] [T-003] 核心业务逻辑跑通（不含 AI）
- [ ] [T-004] 前端页面能调用 API 并展示结果
- [ ] [T-005] 部署到公网可访问（Vercel + Railway）
- [ ] [T-006] 演示路径全流程贯通

### P1 — 做了加分，不做扣分

- [ ] [T-007] AI 能力集成（RAG / CV 推理）
- [ ] [T-008] 用户认证（JWT / Session）
- [ ] [T-009] 移动端适配
- [ ] [T-010] 错误提示友好化

### P2 — 做完是惊喜

- [ ] [T-011] 分享到社交平台
- [ ] [T-012] 数据分析仪表盘
```

**P0 控制在 5-8 个，P1 控制在 4-6 个。**
