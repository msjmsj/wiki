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

GoF 23 + 扩展模式,四个板块 × 若干子组(按「被解耦/被变化的东西」细分)。

- **收录是自描述的**:概念文件带 `gof: { group, subgroup, intent, aka? }` 即自动入页,
  无需登记;group/subgroup 必须存在于 `render/patterns-layout.ts` 的注册表(校验兜底)
- 反向链接(← 树上的叶子)构建时自动反查;点击切回树视图并定位
- 只有「新增大类/子组」才需要改 patterns-layout.ts

## 常见修改

| 需求 | 操作 |
|---|---|
| 加概念 / 加叶子 | **首选脚手架**:`cd web && npm run new -- concept/leaf ...`(自动模板 + 冲突检查 + 立即校验) |
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

### 三层文本的分工(互不重复)

| 字段 | 角色 | 规则 |
|---|---|---|
| `name` | 胶囊上的名字 | 用户扫一眼就懂,不解释 |
| `detail` | 速记提示 | 回答「怎么做 / 怎么识别」,不复述定义;能点名具体手段就点名(库、语言特性、写法约定) |
| `doc` | 详细讲解 | 自包含但**绝不复读 detail**;多段落用 `\n\n` 分隔 |
| `note`(叶子级) | 本处角色 | 只写这个概念在「这片叶子」里的侧重(前提/保证/直接答案);通用解释永远进概念库 |

### doc 的写法(Markdown)

- **标准 Markdown**:支持 `### 小节标题`、**加粗**、`代码`、代码块、列表、链接
- **支持 Mermaid 图**:\`\`\`mermaid 代码块渲染成图(懒加载,不含图的页面零成本)
- 结构:必须以 `### 小节` 开头;推荐小节:为什么 / 做法 / 步骤 / 常见错误 / 落地 / 注意 / 变体 / 局限 / 反例
- 自包含但**绝不复读 detail**;优先给「判断法」和「常见错误」,不写教科书导论

### 机械校验(web/,不靠自觉)

`npm run check`(已内置进 `npm run build`)会对全部 JSON 执行:
- **结构错误**(直接失败):叶子缺 symptom/keywords、引用不存在的概念、
  标签类型错、parent 不存在/成环/指向非 problem 概念
- **规范警告**:detail 超 80 字、doc 复读 detail(句子级检测)、
  doc 未以 `###` 小节开头或残留旧式「标签:」段落、概念未被任何叶子引用
- doc 是 Markdown,可含 \`\`\`mermaid 图

规则只进本文件没用,必须能落到 `web/src/validate.ts` 才算数。

### 分类与结构

- 方案层级用 `level` 区分:`principle` 原则(判断准则)/ `pattern` 设计模式(有名字的结构)/
  `mechanism` 机制(具体手段);带 `gof` 字段自动算 pattern,默认 mechanism
- 问题性质支持父子层级:子性质写 `"parent": "<父概念id>"`(如 变化耦合 → 耦合)
- 多个方案关键字并列时分清关系:
  - **替代关系**(任选一个):平铺即可,如「超时 / 重试 / 熔断 / 降级」
  - **因果链**(各司其职、合起来才是答案):在 `note` 开头标明角色,如「前提:」「保证:」「直接答案:」
- 叶子只增不删;大类和性质骨架极少变,变动前先想清楚是不是走错了分类
- 概念只引用不重复定义:同一概念出现在多片叶子,解释只存在 concepts/ 里一份
