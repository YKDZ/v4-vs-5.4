# 术语库项目对比评估（a vs b）

本报告对同一份规划文档 [测试用的规划文档.md](测试用的规划文档.md) 下由两个不同 LLM Agent 一次性产出的两个仓库 `a/` 与 `b/` 做公平评测。评测维度按用户要求聚焦在四条：规划实现度、代码质量（typecheck/lint）、运行正确性、前端美观度。

评测时间：2026-04-24；评测环境：Linux + pnpm 10 + Node 22，使用各项目本地安装的 `tsc` / `vue-tsc` / `vitest`。未尝试修复任何一方的缺陷，仅做观察记录。

---

## 1. 规划实现度

两边都完整落实了规划的 3 个 workspace 包（`shared / server / client`）、5 张表（`concepts / language_sections / term_entries / regression_reports / regression_results`）、三层后端（Repository → Service → Route）、四个前端视图、Pinia + Vue Router 前端栈、Hono + Drizzle + zod-validator 后端栈，并实现了 Levenshtein 编辑距离、TBX 导入导出与回归验证。从"功能齐全 vs 明显偏移"这个门槛看，两者都没有跑偏。

细节差异：

| 项 | a | b |
|---|---|---|
| 目录与规划第 10 节对齐 | 完全对齐 | 完全对齐 |
| Drizzle relations 单独文件 | 有 [`relations.ts`](a/packages/server/src/db/schema/relations.ts) | 有 [`relations.ts`](b/packages/server/src/db/schema/relations.ts)，另多出 [`sql.ts`](b/packages/server/src/db/schema/sql.ts) 用于测试态直接建表 |
| 单元/集成测试 | **无** `tests/` 目录 | [`packages/server/tests/`](b/packages/server/tests/) 与 [`packages/shared/tests/`](b/packages/shared/tests/) 共 6 个测试，覆盖 CRUD、回归验证、TBX 往返、schema、fuzzy-match |
| Seed 脚本 | [`db/seed.ts`](a/packages/server/src/db/seed.ts) | [`db/seed.ts`](b/packages/server/src/db/seed.ts)，另提供 `seedIfEmpty()` 被测试复用 |
| XML 处理 | 字符串拼接 + 正则解析，未用 XML 库 | 使用 `fast-xml-parser` |
| TBX 往返一致性 | 导入时生成新 UUID，严格意义上无法保持一致 | 有专门的往返测试并通过 |
| 环境变量样例 | 真实的 [`.env`](a/.env)（而非 `.env.example`，略不规范） | [`.env.example`](b/.env.example) |
| 根 `tsconfig.base.json` | 无 | 有 |

结论：**两者都忠实实现了规划，b 还额外提供了测试、共用基类 tsconfig 与更规范的环境样例**，在工程完整度上更接近生产级别。

---

## 2. 代码质量（typecheck / lint）

使用每个仓库本地的 TypeScript 工具链执行严格类型检查（`tsc --noEmit` 与 `vue-tsc --noEmit`）。

### a 的结果

- `packages/shared`：通过。
- `packages/server`：**失败 1 处**：

  ```
  src/services/regression.service.ts(133,5): error TS2322:
    Type '{ ...; reportName: string | null; ... }' is not assignable to type 'RegressionReport'.
      Types of property 'reportName' are incompatible.
        Type 'string | null' is not assignable to type 'string'.
  ```

  出在 [`packages/server/src/services/regression.service.ts:133`](a/packages/server/src/services/regression.service.ts#L133)。共享包里的 `RegressionReport.reportName: string` 与 Drizzle 返回的 `string | null` 不匹配，说明 schema / 共享类型 / service 三处的真值未打通。

- `packages/client`：通过（`vue-tsc --noEmit` 无错）。

另有多处手写 `as` 断言（如 [`regression.service.ts:171 的 mapResult`](a/packages/server/src/services/regression.service.ts#L171)），把 `Record<string, unknown>` 直接强转成领域类型；[`term-entry.service.ts:34`](a/packages/server/src/services/term-entry.service.ts#L34) 使用 `data as Record<string, unknown>` 绕过类型校验。这些虽然不会触发 TS 错误，但属于"用断言掩盖真实类型不一致"的反模式。

### b 的结果

- `packages/shared` / `packages/server` / `packages/client`：**全部通过**，无任何 TS 错误。
- 源码中没有出现 `any` / `@ts-ignore`；对不确定的 DB 字符串值引入了 `isTermType()` / `isTermStatus()` / `isRegressionMatchType` 等 type guard（见 [`concept.repository.ts`](b/packages/server/src/repositories/concept.repository.ts)、[`regression.service.ts`](b/packages/server/src/services/regression.service.ts)），把边界收紧在真正的数据入口处。

两个项目都没有引入 ESLint 配置（规划里也没强制要求），因此"lint"维度不再展开，但 b 的类型表达更干净是明确事实。

**结论：b 在 typecheck 上零错误且没有欺骗性的强制断言，a 存在 1 个阻塞性编译错误和多处 `as` 规避。**

---

## 3. 运行正确性

### b

- `pnpm --filter @termbase/shared test` 3/3 通过（schema 规范化、验证规则）。
- `pnpm --filter @termbase/server test` 3/3 通过，覆盖：
  - Concept + Term 全链路 CRUD；
  - 含 deprecated 目标术语的回归验证能正确产出 mismatch；
  - TBX **导出后再导入** 的往返测试。

  测试用 `createTestDatabaseContext()`（[`db/testing.ts`](b/packages/server/src/db/testing.ts) + [`schema/sql.ts`](b/packages/server/src/db/schema/sql.ts)）搭建隔离数据库，不依赖 docker。共 6/6 通过，总耗时约 3.5s。

### a

- 无任何自动化测试，只能做静态 bug 记录：

  | # | 位置 | 现象（不修复） |
  |---|---|---|
  | A1 | [`regression.service.ts:72–76`](a/packages/server/src/services/regression.service.ts#L72-L76) | 先 `findBestMatch(expected, [expected])` 再 `findBestMatch(expected, [targetText])`，前者必然返回 1.0 完全匹配，变量 `match` / `checkMatch` 被定义却未使用；真正的"译文是否含期望术语"靠紧跟着的 `lowerTarget.includes(expected.toLowerCase())` 完成，模糊匹配路径实际上没走 Levenshtein，仅作为兜底再做一次 `findBestMatch(targetText, expectedTerms, matchThreshold)`，逻辑冗余且与规划第 9.2 节"在目标文本中做模糊匹配"的流程不一致 |
  | A2 | [`regression.service.ts:189`](a/packages/server/src/services/regression.service.ts#L189) 的 `checkIfDeprecated` | 仅判断 `expectedTerms[0]` 是否等于命中值，并不查询术语库 `status === 'deprecated'`，"禁用术语检查"未实现 |
  | A3 | [`tbx.service.ts`](a/packages/server/src/services/tbx.service.ts) | 导出为字符串拼接，导入使用 `/<termEntry[^>]*id="([^"]*)"/g` 等正则。无法处理属性乱序、嵌套、XML 实体/CDATA；导入时会为每个 `<termEntry>` 生成**新** UUID，无法保持往返一致性 |
  | A4 | [`term-entry.service.ts:52-68`](a/packages/server/src/services/term-entry.service.ts#L52-L68) 的 `getTargetTermsForLanguage` | 按 `conceptId` 返回同语言段的所有术语，但上游调用只取 `expectedTerms[0]` 写入结果，对多同义词场景不成立 |
  | A5 | [`regression.service.ts:133`](a/packages/server/src/services/regression.service.ts#L133) | 即前述 TS 编译错误，同时也是运行时回归报告可能出现 `reportName: null` 的合法场景未被共享类型表达 |
  | A6 | [`.env`](a/.env)（而非 `.env.example`） | 仓库内直接放了真实（占位）连接串，开发期易污染，不符合惯例 |

由于 a 的服务端 **编译都过不了**，在不修复的前提下连 `pnpm build` 都无法产出；b 的构建 + 测试全部绿灯。

**结论：b 可运行、有测试背书；a 在给出的状态下无法通过 `tsc`，也没有任何测试证明回归/TBX 流程的正确性，并且上述 A1/A2/A3/A4 都是看得见的逻辑缺陷。**

---

## 4. 前端美观度

两边都遵循规划的"最小化 CSS、不引入 UI 框架"。

### a

- 全局 CSS 约 121 行（[`main.css`](a/packages/client/src/styles/main.css)），定义 `--primary: #4a4ae0`（紫蓝）、小圆角（6px）、扁平按钮（白底边框），其余布局基本写在各 `.vue` 的 scoped 块里（单文件最多 244 行，总 `.vue` 代码量约 1544 行）。
- 视觉风格偏"传统表单后台"：浅灰背景、紫色主按钮、表格感强。
- 优点是每个组件样式局部自治；缺点是各组件风格容易漂移，没有统一的卡片/间距系统。

### b

- 全局 CSS 约 247 行（[`main.css`](b/packages/client/src/styles/main.css)），建立了一套设计 token：主色 `#2563eb`、深色顶栏 `#111827`、大圆角（0.75–1rem）、带阴影的卡片（`box-shadow: 0 8px 24px rgba(15,23,42,.06)`）、`badge` 圆胶囊、`stat-card` 统计卡、`regression-layout` 双栏布局，并有 `@media (max-width: 900px)` 的移动断点。
- `.vue` 文件更薄（总 880 行），样式集中于全局，视觉一致性更好。
- 整体更接近"现代 SaaS 后台"风格：顶栏、卡片、徽章、响应式栅格齐备。

**结论：b 的前端在色彩、层次、响应式、一致性四项上均优于 a；a 可用但观感更朴素且易有组件间风格不一致。**

---

## 5. 其它横向差异

- **Drizzle 关系查询**：两者都以 `db.query.xxx.findMany({ with: ... })` 形式使用 relational queries，差异不大。
- **响应格式**：两者都统一为 `{ success, data, error?, meta? }`。
- **API 客户端**：两者都封装了 fetch 并有统一错误类型。b 的 [`api/client.ts`](b/packages/client/src/api/client.ts) 暴露了 `ApiClientError`，颗粒度稍细。
- **测试基础设施**：b 单独做了 [`db/testing.ts`](b/packages/server/src/db/testing.ts) + [`services/container.ts`](b/packages/server/src/services/container.ts)，把服务层做成可注入容器，使得 `createApp(services)` 天然可测；a 的 service/repository 都是顶层单例 import，测试注入成本显著更高——这也间接解释了为什么 a 根本没写测试。

---

## 6. 评分汇总

| 维度 | a | b |
|---|---|---|
| 规划对齐度 | 合格 | 合格 + 额外提供测试与根 tsconfig |
| Typecheck | **1 个阻塞性错误** + 多处 `as` 逃逸 | **全部通过**，无 `any`/`ts-ignore` |
| 可运行性 | 无测试，至少 6 个明显逻辑/实现缺陷（A1–A6） | 6/6 自动化测试通过，含 TBX 往返与回归验证集成测试 |
| TBX 质量 | 字符串拼接 + 正则解析，不可靠 | `fast-xml-parser` + 往返测试 |
| 回归验证算法 | 走了大量冗余/无效分支，禁用术语检查伪实现 | 明确走 exact → fuzzy → no_match → missing，deprecated 有真查询 |
| 前端美观度 | 朴素传统风 | 现代 SaaS 风，设计 token 与响应式更完整 |
| 架构可测性 | 顶层模块化，难注入 | 显式 `ServiceContainer`，天然可测 |

---

## 7. 最终判断

**b 项目明显更好**，核心理由：

1. **代码质量一票否决层面**：a 的 `packages/server` 在开箱即用的 `tsc --noEmit` 下直接报错（[`regression.service.ts:133`](a/packages/server/src/services/regression.service.ts#L133)），意味着 `pnpm build` 无法完成；b 的 shared/server/client 三处类型检查全部零错误。
2. **"能跑"有客观证据**：b 附带 6 个 vitest 测试覆盖概念/术语 CRUD、回归验证、TBX 往返、shared schema，本次评测中全部通过；a 没有一行测试，其 TBX 导入（正则解析 + 新 UUID）和回归验证（`findBestMatch(expected, [expected])` 冗余调用、禁用术语伪检查）都有看得见的正确性风险。
3. **前端观感**：b 建立了统一的设计 token、响应式栅格、卡片阴影与徽章系统，a 更像传统表单后台且样式散落在各 SFC 里。
4. **工程化细节**：b 提供了 `.env.example`、根 `tsconfig.base.json`、可注入的 `ServiceContainer` 与测试用 DB 工厂；a 将真实 `.env` 提交到仓库、服务以顶层单例导出，导致既不易测也不易切换实现。

在规划完成度、代码质量、运行正确性、前端美观度这四个用户强调的维度上，b 都处于优势，且在"能否给出可运行的最终结果"这个最强指标上 b 赢得比较明显。
