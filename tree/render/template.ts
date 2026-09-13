import { readFileSync } from "node:fs";
import type { Category, ConceptEntry } from "../types.ts";
import { renderCategory } from "./render.ts";

/** 样式在同目录 styles.css 里独立维护,构建时内联 → 产物保持单文件 */
const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8").trim();

/** 视图切换(约 10 行,无依赖):同一数据的多种投影,一键切换 */
const SCRIPT = `
const btns = document.querySelectorAll(".views button");
function setView(v) {
  document.body.dataset.view = v;
  btns.forEach((b) => b.classList.toggle("active", b.dataset.view === v));
}
btns.forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
// 模式视图里点回跳链接:切回树视图,锚点跳转交给浏览器默认行为
document.querySelectorAll(".view-patterns a.back").forEach((a) =>
  a.addEventListener("click", () => setView("tree")),
);
`.trim();

export interface View {
  key: string;
  label: string;
  body: string;
}

/** 页面外壳:内联样式 + 视图切换栏(多视图时) */
export function pageShell(opts: { title: string; views: View[] }): string {
  const first = opts.views[0]!;
  const nav =
    opts.views.length > 1
      ? `<nav class="views">\n${opts.views
          .map(
            (v) =>
              `  <button data-view="${v.key}"${v.key === first.key ? ' class="active"' : ""}>${v.label}</button>`,
          )
          .join("\n")}\n</nav>`
      : "";
  const sections = opts.views
    .map((v) => `<div class="view view-${v.key}">\n\n${v.body}\n\n</div>`)
    .join("\n\n");
  const script = opts.views.length > 1 ? `\n<script>${SCRIPT}</script>` : "";
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${opts.title}</title>
<!-- 本文件由 tree/render/build.ts 生成,请勿手改;修改内容请编辑 tree/content/ 与 tree/concepts/ 下的 JSON 文件 -->
<style>
${css}
</style>
</head>
<body data-view="${first.key}">

${nav}
${sections}${script}
</body>
</html>
`;
}

export function renderTreeBody(
  categories: Category[],
  concepts: Record<string, ConceptEntry>,
): string {
  const cols = categories.map((c) => renderCategory(c, concepts)).join("\n\n");
  return `<div class="poster">\n\n${cols}\n\n</div>`;
}
