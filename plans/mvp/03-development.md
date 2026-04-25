# Phase 3 — 开发冲刺

> 目标：**代码先行**，演示第一，功能第二，性能第三
> 时机：黑客松核心时间
>
> **💡 Team 提醒**：
> - 开发主力功能 → `/team fullstack-dev`（frontend + backend + db 并行）
> - 发现 bug → `/team fix-and-verify`（3 fixer 并行修 + verifier 验证）
> - 需要重构 + 测试 → `/team refactor-and-test`

---



---

## 核心产出

- [ ] main 分支上跑通的 MVP（可部署）
- [ ] 每 P0 功能完成后提交一次
- [ ] 每 4 小时向队友同步进度（3 人+团队）

---

## 开发节奏（24 小时示例）

```
Hour 0-4:   完成 P0 #1-#3（骨架 + 核心 API + 前端页面）
Hour 4-8:   完成 P0 #4-#6（部署 + 演示路径全通）
Hour 8-12:  完成 P1 #1-#2（AI 能力集成）
Hour 12-16: 集成测试，修复 P0 级别 Bug
Hour 16-20: P1 #3-#4，性能优化，UI 打磨
Hour 20-24: 备用 / 应急 / 最后一公里
```

**核心原则**：
1. **每 2 小时提交一次** — 不要等"写完了"再提交
2. **先跑通再优化** — 100% 功能但卡顿 > 80% 功能但流畅
3. **每天保证 6 小时睡眠** — 熬夜是最大的风险
4. **AI 集成放在 P0 跑通之后** — 先让基础功能可演示

---

## 开发顺序

```
第 1 步：后端骨架
├── FastAPI 入口 + CORS 配置
├── SQLAlchemy 模型 + 迁移
├── 基础 CRUD API 路由
└── 验证：curl localhost:8000/api/health

第 2 步：数据库层
├── MySQL 连接（复用 traffic-defect-detection 的 database.py）
├── Repository 模式封装
└── 验证：数据库读写正常

第 3 步：前端页面
├── Next.js 页面骨架
├── shadcn/ui 组件安装
├── API 客户端配置
└── 验证：页面能调通后端 API

第 4 步：部署（提前做！）
├── Railway 后端（dockerfile 准备好）
├── Vercel 前端
└── 验证：公网可访问，无 CORS 问题

第 5 步：AI 能力集成
├── LangGraph Agent（从 myagent 复制 coordinator 逻辑）
├── Qdrant 向量检索
└── Claude API / MiniMax-M2.7 调用

第 6 步：Rerank + 生成
├── BGE Reranker 集成
└── 流式输出（Streaming）
```

---

## TDD 轻量执行

**MVP TDD 规则（简化版）**：
1. 选一个 P0 任务
2. 写一个最简单的"成功用例"测试（5 分钟）
3. 实现到测试通过（20 分钟内）
4. 继续下一个任务

**不需要追求覆盖率**，只需要：
- 每个 AI API 调用有一个"它能工作"的测试
- 核心用户路径有一个 E2E 检查
- 每个 API 路由有一个基本的 happy path 测试

