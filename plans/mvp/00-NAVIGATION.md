# MVP 工作流导航

黑客松 48 小时从想法到可演示 MVP。按顺序执行。

---

## 一页执行流

| 时间 | 阶段 | 文档 | 核心产出 |
|------|------|------|---------|
| 赛前 | 准备 | [Checklist ↓](#赛前准备-checklist) | 骨架 push 到 GitHub |
| 第 1 小时 | 想法 | [`01-idea.md`](./01-idea.md) | PRD 填写完毕，Git 初始化 |
| 第 1-5 小时 | 架构 | [`02-architecture.md`](./02-architecture.md) | 系统设计图 + TASKS.md |
| 第 5-36 小时 | 开发 | [`03-development.md`](./03-development.md) | MVP 可部署，P0 全完成 |
| 第 36-48 小时 | 打磨演示 | [`04-polish.md`](./04-polish.md) + [`05-demo.md`](./05-demo.md) | 演示路径通，脚本练 3 遍 |
| 评审后 | 复盘 | [Checklist ↓](#赛后复盘-checklist) | 代码归档，经验沉淀 |

---

## 决策树

```
新项目？
├── 否 → 直接 [03-development.md]
└── 是 → 黑客松开场
    ├── 第 1 小时 → [01-idea.md]（想法确认 + PRD）
    ├── 第 1-5 小时 → [02-architecture.md]（架构 + TASKS.md）
    └── 第 5 小时后 → [03-development.md]（全力开发）

需要进行调研或设计？→ `/team research-and-design`
需要并行开发多个模块？→ `/team fullstack-dev`
发现 bug 需要修复？→ `/team fix-and-verify`
需要进行重构或提升测试覆盖？→ `/team refactor-and-test`
需要 UI 打磨或部署上线？→ `/team polish-and-deploy`

遇到构建错误？→ `build-error-resolver` agent
代码修改后？→ 自动 `code-reviewer` agent
需要写测试？→ `tdd-guide` agent
```

---

## 阶段结束检查

```
□ Phase 1 结束：PRD 核心章节填写完毕，Git 已初始化，第一个 commit 已提交
□ Phase 2 结束：系统设计图完成，TASKS.md P0 控制在 5-8 个，第一个功能分支已切出
□ Phase 3 结束：P0 任务全部完成，MVP 部署到公网可访问
□ Phase 4 结束：演示路径验证通过（<3s 首屏、按钮全可点），备用录屏已准备
□ Phase 5 结束：演示脚本练 3 遍，Plan A/B/C 全部就绪
```

---

## Agent Teams 索引

| 阶段 | 推荐 Team | 调用方式 |
|------|-----------|---------|
| Phase 2 | `research-and-design` | `/team research-and-design` |
| Phase 3 | `fullstack-dev` | 前端 + 后端 + 数据库并行开发 |
| Phase 3 | `fix-and-verify` | 发现 bug 时，3 fixer 并行修 + verifier 验证 |
| Phase 3 | `refactor-and-test` | 需要重构或提升测试覆盖时 |
| Phase 4-5 | `polish-and-deploy` | UI 打磨 + 部署验证 |

---

## 赛前准备 Checklist

```
□ 项目骨架 push 到 GitHub（方便现场 fork）
□ docker-compose up -d 本地服务全部正常（MySQL + Redis）
□ Claude API / MiniMax API 账号已验证 quota
□ 笔记本开发环境就绪（Python · Node.js · Git）
□ 准备 60 秒电梯演讲稿
□ 了解目标平台限制（API 限额 · 平台规则）
```

---

## 赛后复盘 Checklist

```
□ 项目代码整理提交，README 更新
□ 将可复用模块提取到骨架项目中
□ 总结 agent 调用效果，更新本导航文档
□ Qdrant / YOLO 模型权重备份
□ 向 myagent / traffic-defect-detection 回流有价值模块
```
