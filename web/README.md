# web/ —— 前端应用(Vite + React + TS)

分化树的前端运行时渲染版本。数据仍读 `../tree/content/` 和 `../tree/concepts/`
(单一数据源不变),渲染在浏览器端完成。

## 开发

```bash
# 统一 CLI(仓库根目录)
./wiki dev                     # 开发服务器(默认 http://localhost:5173)
./wiki check                   # 数据校验(机械规范检查)
./wiki build                   # 校验 + 生产构建到 web/dist/
./wiki new concept|leaf ...    # 内容脚手架
./wiki typecheck               # tsc 类型检查
# 也兼容:cd web && npm run dev|check|build|new
```

## 结构

```
src/
├─ types.ts          内容模型(与 tree/types.ts 一致)
├─ data.ts           import.meta.glob 读 tree/ 的 JSON + 加载即校验
├─ validate.ts       校验规则(与旧 loader 一致:缺字段/概念不存在/类型错/parent 环)
├─ util.ts           聚类(rootOf/clusterCategory)、锚点、usage 反查
├─ Tag.tsx           概念胶囊(纯 CSS 弹层,与旧版同交互)
├─ TreeView.tsx      分化树视图
├─ PatternsView.tsx  设计模式视图(LAYOUT 分类配置在这里)
├─ App.tsx           视图切换(双视图挂载,body[data-view] 控制显隐,锚点始终有效)
└─ styles.css        与 tree/render/styles.css 同源
```

## 与 tree/(旧静态生成器)的关系

tree/render/ 是旧的构建时渲染管线,产出根目录的 `问题-方案分化树.html`;
web/ 是它的前端架构继任者。两者共用同一份 JSON 数据与校验规则。
确认 web/ 满足需求后,旧管线与静态产物可以退役。
