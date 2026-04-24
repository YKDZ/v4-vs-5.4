# termbase-app

基于 **Vue 3 + Hono + Drizzle + PostgreSQL** 的概念导向术语库管理系统（Concept-oriented Termbase），包含术语 CRUD、术语回归验证、TBX 导入导出。

## 功能

- 概念管理：分页、搜索、增删改查
- 多语言术语条目管理：按语言组织，支持状态/词性/术语类型
- 术语回归验证：精确匹配 + Levenshtein 模糊匹配 + deprecated 术语告警
- TBX 导入导出：XML 解析与生成
- 统一 API 响应结构：`{ success, data?, error?, meta? }`

## 项目结构

```text
packages/
  shared/   # 共享类型与 Zod Schema
  server/   # Hono + Drizzle 后端
  client/   # Vue 3 + Vite 前端
```

## 环境准备

1. 复制环境变量：

```bash
cp .env.example .env
```

2. 启动 PostgreSQL：

```bash
docker compose up -d
```

3. 安装依赖：

```bash
pnpm install
```

## 常用命令

```bash
# 开发（前后端并行）
pnpm dev

# 类型检查
pnpm typecheck

# 构建
pnpm build

# 测试
pnpm test
```

## 数据库相关（server 包）

```bash
pnpm --filter @termbase/server db:generate
pnpm --filter @termbase/server db:migrate
pnpm --filter @termbase/server seed
```

## API 基础路径

- `http://localhost:3000/api/v1`

主要路由：

- `GET/POST/PUT/DELETE /concepts`
- `GET/POST /concepts/:conceptId/terms`
- `PUT/DELETE /terms/:id`
- `GET /terms/search`
- `POST /regression/verify`
- `GET /regression/reports`
- `GET /regression/reports/:id`
- `POST /tbx/import`
- `GET /tbx/export`
