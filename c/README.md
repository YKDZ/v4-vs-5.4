# Termbase 全栈术语库应用

基于 TBX（ISO 30042）**概念导向（Concept-oriented）**数据模型的术语库管理系统，
内置简化版**术语回归验证器**（Terminology Verifier），支持 TBX 导入/导出。

## 技术栈

- **前端**：Vue 3 + Vite + TypeScript + Pinia + Vue Router
- **后端**：Hono.js + Drizzle ORM + Zod
- **数据库**：PostgreSQL 16（或内置 pglite，无需额外依赖即可开发和测试）
- **工具**：pnpm workspaces monorepo

## 目录结构

```
packages/
  shared/   # 共享类型 & Zod schema
  server/   # Hono API + Drizzle schema + 回归引擎 + TBX import/export
  client/   # Vue 3 前端
```

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 启动后端（默认使用内置 pglite，无需额外服务）
pnpm dev:server

# 3. （可选）填充示例数据
pnpm seed

# 4. 启动前端（代理到 http://localhost:3000）
pnpm dev:client
# 打开 http://localhost:5173
```

### 使用真实 PostgreSQL

```bash
cp .env.example .env
# 编辑 .env，取消注释 DATABASE_URL
docker compose up -d postgres
export DATABASE_URL=postgres://termbase:termbase@localhost:5432/termbase
pnpm dev:server
```

## 运行测试

```bash
pnpm test
```

集成测试覆盖：概念 CRUD、多语言术语管理、术语搜索、术语回归验证（精确/模糊/禁用术语检查）、TBX 导入/导出。

## API 概览（base path: `/api/v1`）

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET`    | `/concepts` | 分页 + 搜索列表 |
| `GET`    | `/concepts/:id` | 概念详情（含语言段与术语） |
| `POST`   | `/concepts` | 创建概念 |
| `PUT`    | `/concepts/:id` | 更新概念 |
| `DELETE` | `/concepts/:id` | 删除概念 |
| `GET`    | `/concepts/:id/terms?lang=xx` | 按语言列出术语 |
| `POST`   | `/concepts/:id/terms` | 添加术语条目 |
| `PUT`    | `/terms/:id` | 更新术语 |
| `DELETE` | `/terms/:id` | 删除术语 |
| `GET`    | `/terms/search?q=&lang=` | 术语搜索 |
| `POST`   | `/regression/verify` | 执行术语回归验证 |
| `GET`    | `/regression/reports` | 历史报告 |
| `GET`    | `/regression/reports/:id` | 报告详情 |
| `GET`    | `/tbx/export` | 导出 TBX |
| `POST`   | `/tbx/import` | 导入 TBX |

所有响应遵循统一格式：

```json
{ "success": true, "data": ..., "meta": { "page": 1, "total": 42 } }
{ "success": false, "error": { "code": "CONCEPT_NOT_FOUND", "message": "..." } }
```

## 回归验证说明

参考 SDL MultiTerm Terminology Verifier 的核心思路：

- **术语提取**：根据术语库在源文本中扫描已知术语（支持 CJK / Latin 的边界识别，长词优先）。
- **期望术语**：同一概念下优先选择 `preferred` 状态术语，其次 `admitted`。
- **目标文本比对**：精确包含（exact） → 基于编辑距离的模糊匹配（fuzzy，阈值默认 0.75） → `no_match`。
- **禁用术语检查**：若目标文本中出现 `deprecated` 状态的术语，额外生成 error 级记录。
- **缺失翻译**：若概念缺少目标语言术语，记为 `missing`。
- **一致性得分**：`(exact + 0.5 × fuzzy) / total`。
