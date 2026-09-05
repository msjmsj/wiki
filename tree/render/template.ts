import { readFileSync } from "node:fs";
import type { Category, ConceptEntry } from "../types.ts";
import { renderCategory } from "./render.ts";

/** 样式在同目录 styles.css 里独立维护,构建时内联 → 产物保持单文件 */
const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8").trim();

export function renderPage(
  categories: Category[],
  concepts: Record<string, ConceptEntry>,
): string {
  const cols = categories.map((c) => renderCategory(c, concepts)).join("\n\n");
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>问题 → 方案 分化树</title>
<!-- 本文件由 tree/render/build.ts 生成,请勿手改;修改内容请编辑 tree/content/ 与 tree/concepts/ 下的 JSON 文件 -->
<style>
${css}
</style>
</head>
<body>

<div class="poster">

${cols}

</div>

</body>
</html>
`;
}
