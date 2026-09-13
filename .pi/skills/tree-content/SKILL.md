---
name: tree-content
description: 分化树 wiki 的内容维护规程。任何"给树/模式页添加或修改内容"类任务动手前先读本文件。内容:数据模型速览(大类/叶子/概念库/层级字段)、添加叶子与概念的标准流程、detail/doc/note 三层文本分工、机械校验(npm run check)、设计模式视图布局、提交推送。触发词:加叶子、加概念、新问题、新方案、加模式、补充讲解、加子性质、改 detail、改 doc、分化树。
---

# 分化树内容维护规程

> 一句话:内容是 JSON,呈现是渲染器。改内容只动 `tree/content/` 和 `tree/concepts/`,
> 跑 `npm run check`(在 `web/` 目录)校验,视图自动更新。

## 数据模型速览

```
Category(大类)  → tree/content/<领域>.json     一个文件 = 一个大类(按文件名排序)
Leaf(叶子)      → 大类 JSON 的 leaves 数组     渲染时按 tags[0](主性质)聚类
Concept(概念)   → tree/concepts/<kind>/<id>.json
                  kind = problem(问题性质,支持 parent 父子层级)
                       / solution(解决方案,支持 level 三级)
```

- 叶子只**引用**概念 id,不自带解释;同一概念在多处出现只维护一份定义
- 叶子可以设 `"id"`(如 `legacy-code`)作为稳定锚点,供 `xref` 交叉引用
- 大类内聚类自动沿 parent 链归族:子性质(如变化耦合)归入父概念(耦合)家族

## 添加内容的标准流程

**加一片叶子**:编辑对应大类 JSON 的 `leaves` 数组,1-2 行:

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

**手动加新概念**:在 `tree/concepts/` 对应目录建 `<id>.json`:

```jsonc
// concepts/solution/adapter.json
{
  "name": "适配器",                    // 胶囊显示名
  "detail": "速记提示:怎么做,点名手段",  // ≤80 字,机械校验
  "doc": "定义:…\n\n做法:…\n\n常见错误:…",  // 可选,详细讲解;段落以「标签:」开头
  "level": "pattern"                   // 仅 solution:principle 原则 / pattern 模式 / mechanism 机制
                                       // (带 gof 字段自动算 pattern,默认 mechanism)
}
// concepts/problem/coupling-change.json 可额外有 "parent": "coupling"
```

**加 GoF 模式 / 设计模式**(只需 1 个文件):概念文件加 gof 字段即可自动出现在模式页——

```jsonc
"gof": { "group": "结构型", "subgroup": "接口对接", "intent": "一句话意图", "aka": "原名(可选)" }
```

group/subgroup 必须在 `web/src/patterns-layout.ts` 的注册表里(创建型/结构型/行为型/扩展模式
及其子组);只有新增大类或子组才动那个文件。错了会被构建警告。

**加机制**:新建概念文件(不带 gof)+ 在叶子 keywords 里引用,共 2 个文件。

**加子性质**:新建 problem 概念 + `"parent"`,叶子的 tags 改指子性质即可。

## 三层文本分工(铁律:互不重复)

| 字段 | 角色 | 规则 |
|---|---|---|
| name | 胶囊名 | 扫一眼即懂,不解释 |
| detail | 速记提示 | 回答「怎么做/怎么识别」,点名具体手段;不复述定义 |
| doc | 同名 .md 文件(Markdown) | 自包含但**绝不复读 detail**;`### 小节`结构;支持 mermaid 图;脚手架 --with-doc 生成骨架 |
| note | 本处角色 | 只写该概念在这片叶子的侧重;因果链标「前提/保证/直接答案」 |

多关键字并列:**替代关系**平铺(超时/重试/熔断);**因果链**必须在 note 标角色。

## 机械校验(不靠自觉)

```bash
./wiki check    # 校验全部 JSON(已内置进 ./wiki build)
./wiki dev       # 预览 http://localhost:5173
./wiki new ...   # 脚手架(见上)
```

校验内容:结构错误(缺字段/概念不存在/类型错/parent 环)→ 失败;
规范警告(detail 超 80 字 / doc 复读 detail / doc 未以 ### 小节开头或残留旧式标签段 / 概念未被引用 / 模式未排入布局)。
规则要新增时,改 `web/src/validate.ts`,不是只写进 README。

## 提交

```bash
git add -A && git commit -m "…" && git push   # 仓库:msjmsj/wiki(私有)
```

## 坑

- `tree/render/`(旧静态生成器)已退役,别往那边加功能;根目录的 HTML 产物不再更新
- 浏览器端 import 必须带 `.ts` 扩展名(Node 24 ESM 校验脚本的要求)
- `config/` 在 .gitignore 里,密钥绝不入库
