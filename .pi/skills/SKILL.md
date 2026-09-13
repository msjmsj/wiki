---
name: search-toolbox
description: 搜索与资料检索工具箱（REQ-0143）。任何"搜索/查资料/调研/搜代码/抓网页/核实说法"类任务动手前先读本文件。内容：四大检索工具分工路由表（web_search 多 provider、source_check 事实核查、fetch_content 精读页面、gh CLI 代码搜索）、各工具用法要点与坑、provider 可用性自查方法。触发词：搜索、搜一下、查资料、调研、搜代码、code search、GitHub 搜索、抓取、fetch、核实、真的吗、有没有现成的。
---

# 搜索工具箱（REQ-0143）

> 一句话：查资料前先想"我要搜网页、核事实、读全文、还是搜代码"，按下表选工具，别只会用 web_search 一把梭。

## 路由表：什么需求用什么工具

| 需求 | 首选工具 | 说明 |
|---|---|---|
| 网页调研、找资料 | `web_search` | 多 provider 并行，AI 综合答案 + 引用 |
| 核实一条说法真伪 | `source_check` | 返回结构化结论 + 原文摘录引用；判定偏保守，适合交叉验证 |
| 精读某个已知页面/PDF/视频 | `fetch_content` | URL → markdown；支持 GitHub 仓库、YouTube 字幕、视频抽帧；`mode: "answer"` 可带问题直接答 |
| 从已抓内容里再找段落 | `get_search_content` | 用 responseId 二次检索，不重复发请求 |
| **全 GitHub 搜代码** | `gh search code`（bash） | 真正的代码级搜索，网页搜索替代不了 |
| 找仓库/项目 | `gh search repos` + Exa | 两者配合 |

## web_search 用法要点

- **多角度多 query**：研究类任务用 `queries: [...]` 传 2~4 个不同措辞/范围的查询，比单查询覆盖面大得多。
- **并行多 provider 交叉验证**：`provider: ["exa", "kimi", "parallel-mcp", "anysearch", "tavily"]`；重要调研别只信一家。要全文内容用 Parallel MCP，要一手技术文档用 Exa，中英文混搜加 Kimi，免费完底加 DuckDuckGo。
- **agent 内测速/对比时**加 `workflow: "none"`，避免打开交互式浏览器 curator。
- 默认行为：不传 provider 时系统自动选（本机当前优先 Exa）。

## provider 特点与可用性自查

**特点（2026-09-06 实测，样本小，仅第一印象）**：Exa 擅长技术文档/一手资料（AI 语义搜索，直接返正文）；Kimi 中英文覆盖均衡；Parallel MCP 返回整页正文、内容最厚，适合深度调研；Anysearch 结果精准（直接命中官方文档）；DuckDuckGo 免费兜底、偏新闻软文。

**可用性是快变量，以实测为准，别背结论**。自查方法：一次调用传多个 provider，看返回里的 `Provider errors`——报错信息会写明缺什么 key、配到 `~/.pi/web-search.json` 的哪个字段。快照（2026-09-06，28 个全测）：Exa / Kimi / DuckDuckGo / Parallel MCP / Anysearch / Tavily 共 6 个可用，其余未配 key。

**key 的户口**（2026-09-06 用户裁决）：免费额度 key 集中存仓库内 `config/api-keys.json`（随 git 同步，用户明示免费 key 无所谓泄露）；真正生效处是 `~/.pi/web-search.json`（pi 会话启动时读取，**新配 key 要下个会话才生效**，急用可先 curl 直连验证 key 有效性）。付费 key / 私钥一律不入库。

## gh CLI 代码搜索（已登录，直接用）

- `gh search code "关键词" [--language python] [--repo owner/name]` —— 全 GitHub 代码搜索。
- `gh api repos/owner/repo/contents/path` —— 拿单个文件内容。
- 频率限制：代码搜索约 10 次/分钟，别批量扫。
- 登录状态自查：`gh auth status`。

## fetch_content 的代理坑（本机已踩过）

本机代理是 TUN/fake-IP 模式（域名解析到 198.18.x.x），fetch_content 的 SSRF 防护会拦截，报 `Blocked internal address`。两种修法：
1. 在 `~/.pi/web-search.json` 配 `ssrf.allowRanges: ["198.18.0.0/15"]`；
2. 调用时传 `proxy` 参数走本机 HTTP 代理端口。

## 反面教训

- 单次单 query 测试就下"某 provider 最好"的结论 → 样本量 1 不算数，要对比就用用户真实问题多跑几组。
- 拿 Exa 当代码搜索用 → 它索引的是网页，搜不到仓库深处某行代码；代码搜索一律走 `gh search code`。
