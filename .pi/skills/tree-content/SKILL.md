---
name: tree-content
description: 分化树 wiki 的内容维护规程。任何"给树/模式页添加或修改内容"类任务动手前先读本文件。内容:数据模型速览(大类/叶子/概念库/层级字段)、./wiki 统一 CLI、脚手架添加流程、detail/.md/note 三层文本分工、机械校验、提交即自动部署(GitHub Pages)。触发词:加叶子、加概念、新问题、新方案、加模式、补充讲解、加子性质、改 detail、改 doc、分化树。
---

# 分化树内容维护规程

> 一句话:内容是 JSON + Markdown 文件,呈现是渲染器。改内容只动 `tree/content/` 和
> `tree/concepts/`;统一 CLI 是 `./wiki <cmd>`;`git push` 到 main 即自动部署上线。

## 数据模型速览

```
Category(大类)  → tree/content/<领域>.json      一个文件 = 一个大类(按文件名排序)
Leaf(叶子)      → 大类 JSON 的 leaves 数组      渲染时按 tags[0](主性质)聚类
Concept(概念)   → tree/concepts/<kind>/<id>.json     元数据(name/detail/level/gof/parent)
                + tree/concepts/<kind>/<id>.md       详细讲解(可选,Markdown)
                  kind = problem(问题性质,支持 parent 父子层级)
                       / solution(解决方案,支持 level 三级)
```

- 叶子只**引用**概念 id,不自带解释;同一概念多处出现只维护一份定义
- 叶子可设 `"id"`(如 `legacy-code`)作稳定锚点,供 `xref` 交叉引用
- 大类内聚类自动沿 parent 链归族:子性质(变化耦合)归入父概念(耦合)家族

## 统一 CLI(仓库根目录)

```bash
./wiki new concept|leaf ...   # 脚手架:模板 + 冲突检查 + 立即校验(首选)
./wiki check                  # 数据 + 内容规范校验
./wiki dev                    # 本地预览 http://localhost:5173
./wiki build                  # 校验 + 生产构建到 web/dist/
```

## 添加内容的标准流程

**首选脚手架**(在仓库根目录):

```bash
./wiki new concept --kind solution --id xxx --name 名称 [--level mechanism] [--detail ...] [--with-doc]
./wiki new concept --kind problem  --id xxx --name 名称 [--parent coupling]
./wiki new concept --kind solution --id xxx --name 名称 --gof-group 结构型 --gof-subgroup 接口对接
./wiki new leaf --cat b --symptom "问题表现" --tags consistency --keywords ttl,cache
```

- `--with-doc` 生成同名 `.md` 骨架(### 为什么 / ### 做法 / ### 常见错误)
- TODO 占位、未被引用、模式未排入注册表,都会被 `./wiki check` 持续警告
- 手动写也可以,字段见下

**叶子字段**:

```jsonc
{
  "symptom": "问题表现(必填,加粗扫读入口)",   // 陈述句,说清痛是什么
  "symptomNote": "补充场景(可选,点击弹出)",
  "tags": ["problem-概念id"],                  // 第一个 = 主性质(聚类依据)
  "keywords": ["solution-概念id"],             // 方案;先看概念库有没有现成的!
  "warning": "⚠︎ 代价提醒(可选)",
  "xref": { "target": "#目标叶子id", "text": "⇢ 另一根源在 X" }  // 可选
}
```

**概念文件**(`tree/concepts/<kind>/<id>.json`):

```jsonc
{
  "name": "适配器",            // 胶囊显示名
  "detail": "速记提示:怎么做,点名手段",  // ≤80 字,纯文本
  "level": "pattern",         // 仅 solution:principle/pattern/mechanism(默认 mechanism)
  "gof": {                    // 可选;带它即自动进设计模式页,无需登记
    "group": "结构型",          // 注册表:创建型/结构型/行为型/扩展模式
    "subgroup": "接口对接",     // 子组须在 web/src/patterns-layout.ts 注册表里
    "intent": "一句话意图",
    "aka": "GoF 原名(可选)"
  }
}
// problem 概念可额外有 "parent": "coupling"(子性质)
// 详细讲解不在 JSON:另建同名 adapter.md(Markdown,写法见 doc-writing 技能)
```

## 三层文本分工(铁律:互不重复)

| 字段 | 载体 | 规则 |
|---|---|---|
| name | .json | 扫一眼即懂,不解释 |
| detail | .json | 速记提示,纯文本;回答「怎么做/怎么识别」,点名具体手段;不复述定义 |
| doc | **同名 .md** | Markdown;自包含但**绝不复读 detail**;`### 小节`结构;支持 mermaid;写法模板见 **doc-writing 技能** |
| note | 叶子内 | 只写该概念在这片叶子的侧重;因果链标「前提/保证/直接答案」 |

多关键字并列:**替代关系**平铺(超时/重试/熔断);**因果链**必须在 note 标角色。

## 机械校验(不靠自觉)

`./wiki check`(已内置进 `./wiki build`;CI 每次 push 也跑):
- **结构错误**(失败):缺字段 / 概念不存在 / 类型错 / parent 环
- **规范警告**:detail 超 80 字 / doc 复读 detail / doc 未以 ### 小节开头或残留旧式标签段 / TODO 占位 / 概念未被引用 / 模式未排入注册表

规则要新增时,改 `web/src/validate.ts`,不是只写进 README。

## 提交 = 部署

```bash
git add -A && git commit -m "…" && git push
```

仓库 `msjmsj/wiki`(**公开**);push 到 main → GitHub Actions 自动 `./wiki build` →
部署到 https://msjmsj.github.io/wiki/(约 40 秒;页面右上角版本号 = 日期+提交计数,可核对线上是否最新)。

## 坑

- `tree/render/`(旧静态生成器)已退役,别往那边加功能;根目录的 HTML 产物不再更新
- 浏览器端 import 必须带 `.ts`/`.tsx` 扩展名(Node 24 ESM 校验脚本的要求)
- `config/` 在 .gitignore 里,密钥绝不入库
- 组件更名后注意 import 扩展名同步(曾踩过 `./ConceptDrawer.ts` 应为 `.tsx` 的坑)
