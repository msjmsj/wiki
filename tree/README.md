# 问题 → 方案 分化树(源码)

内容模型:

```
Category(大类)  → content/<领域>.json      文件 = 大类,按文件名排序
Leaf(叶子)      → 大类 JSON 里的 leaves 数组
                  渲染时按「主性质」(tags[0])聚类,并沿 parent 链归族:
                  有子性质的家族显示两级小标题(如 耦合 → 变化耦合)
Concept(概念)   → concepts/<kind>/<id>.json,kind = problem / solution
```

**叶子不定义概念,只引用概念**。两种概念:
- `problem`(问题性质):支持父子层级(`parent` 字段),
  如「变化耦合」的 parent 是「耦合」。叶子的第一个性质标签 = 主性质,
  渲染时提升为聚类小标题
- `solution`(解决方案):适配器、TTL、ADR……挂在特定叶子

## 构建

```bash
cd tree
npm run build        # node render/build.ts(Node 24+ 原生运行 TS,零依赖)
```

产物:`../问题-方案分化树.html`(单文件,样式内联,几乎零 JS——仅 10 行视图切换;
请勿手改,会被覆盖)。一个页面,多个视图(顶部切换):
- **分化树**:大类 → 性质家族 → 子性质 → 叶子
- **设计模式**:GoF 23 模式,三分法 + 16 子组,反向链接跳回树中叶子
构建时校验:叶子缺字段、引用不存在的概念、问题/方案标签用错类型、
parent 不存在/成环/指向非 problem 概念 → 报错;
概念没被任何叶子引用(父概念随子概念被引用、带 gof 标记的除外)→ 警告。

## 目录结构

```
tree/
├─ types.ts                 内容模型(Concept / Category / Leaf)
├─ concepts/
│  ├─ problem/              问题性质概念(耦合 → 变化耦合/结构耦合…)
│  └─ solution/             解决方案概念(适配器、TTL、ADR……)
├─ content/                 树本体:一个 JSON 文件 = 一个大类
│  ├─ a-cognitive.json      A 认知类
│  ├─ b-runtime.json        B 运行类
│  └─ c-collaboration.json  C 协作类
└─ render/                  渲染层,不含任何正文
   ├─ styles.css            全部样式(构建时内联)
   ├─ loader.ts             扫描加载 + 校验
   ├─ render.ts             内容模型 → HTML(含转义、按主性质聚类)
   ├─ template.ts           页面外壳
   └─ build.ts              构建入口
```

## 设计模式视图

GoF 23 模式,三分法打底 + 16 个子组(按「被解耦/被变化的东西」细分)。

- 概念文件加 `gof: { intent, aka? }` 字段即被收录
- 布局与子组顺序在 `render/patterns.ts` 的 `LAYOUT` 配置里
- 反向链接(← 树上的叶子)构建时自动反查;点击切回树视图并定位
- 带 gof 标记但未被树引用的概念是允许的(如桥接、享元)
- 加新视图:在 `render/` 加渲染函数,在 `build.ts` 的 views 数组加一项

## 常见修改

| 需求 | 操作 |
|---|---|
| 加 / 改一片叶子 | 编辑对应大类 JSON 的 `leaves` 数组(1-2 行) |
| 改某个概念的解释 | 编辑 `concepts/<kind>/<id>.json`,所有引用处同时生效 |
| 叶子引用新概念 | 先在 `concepts/` 对应 kind 目录建 `<id>.json`,再引用 id |
| 加子性质 | 新建 problem 概念并写 `"parent": "<父概念id>"`,叶子标签改指子性质 |
| 加一个大类 | 在 `content/` 丢一个 `<领域>.json`,完事 |
| 交叉引用 | 给目标叶子设 `"id"`,引用方加 `"xref": { "target": "#id", "text": "…" }` |
| 加 ⚠︎ 提示 | 叶子上加 `"warning"` |
| 改样式 | `render/styles.css` |

## JSON 字段

一片叶子的完整形态(详见 `types.ts` 注释):

```jsonc
{
  "id": "legacy-code",        // 可选,稳定锚点,供交叉引用指向
  "symptom": "问题表现(必填,加粗,扫读入口)",
  "symptomNote": "补充说明(可选;有则说明表现可点击弹出)",
  "tags": ["coupling-change"], // 问题性质;第一个 = 主性质(聚类小标题),
                               // 其余为次要性质(留在行上)
  "keywords": [
    "concept-id",              // 方案,引用 concepts/solution/
    { "concept": "immutability",
      "note": "前提:消灭偷偷改的途径" }   // 本处角色
  ],
  "warning": "⚠︎ 叶子级注意事项(可选,hover 浮层)",
  "xref": { "target": "#legacy-code", "text": "⇢ 另一根源在 C" }
}
```

概念文件:

```jsonc
// concepts/problem/coupling-change.json
{
  "name": "变化耦合",            // 标签显示名
  "detail": "识别:一处变化沿依赖扩散到多处……",
  "parent": "coupling"          // 可选,父概念(仅 problem)
}
```

## 编写原则

- **detail 回答「怎么做 / 怎么识别」**,不复述定义;能点名具体手段就点名
- **note 只写本处角色**(前提/保证/直接答案、本片叶子的侧重),通用解释永远进概念库
- 概念 detail 一两句话,不是长文——用户扫标签名 > 点标签看解释
- 叶子只增不删;大类和性质骨架极少变,变动前先想清楚是不是走错了分类
