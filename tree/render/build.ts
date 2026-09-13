import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCategories, loadConcepts } from "./loader.ts";
import { pageShell, renderTreeBody } from "./template.ts";
import { buildUsage, renderPatternsBody } from "./patterns.ts";

const concepts = loadConcepts();
const categories = loadCategories(concepts);
const usage = buildUsage(categories);

const OUT = "问题-方案分化树.html";
const html = pageShell({
  title: "问题 → 方案 分化树",
  views: [
    { key: "tree", label: "分化树", body: renderTreeBody(categories, concepts) },
    {
      key: "patterns",
      label: "设计模式",
      body: renderPatternsBody(concepts, usage),
    },
  ],
});
writeFileSync(fileURLToPath(new URL(`../../${OUT}`, import.meta.url)), html, "utf8");

console.log(
  `✓ 已生成 ${OUT}(${categories.length} 个大类 / ${categories.reduce((n, c) => n + c.leaves.length, 0)} 片叶子 / ${Object.keys(concepts).length} 个概念 / 23 个 GoF 模式)`,
);
