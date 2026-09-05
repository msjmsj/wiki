import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCategories, loadConcepts } from "./loader.ts";
import { renderPage } from "./template.ts";

const concepts = loadConcepts();
const categories = loadCategories(concepts);
const out = fileURLToPath(new URL("../../问题-方案分化树.html", import.meta.url));
writeFileSync(out, renderPage(categories, concepts), "utf8");

const leaves = categories.reduce((n, c) => n + c.leaves.length, 0);
console.log(
  `✓ 已生成 ${out}(${categories.length} 个大类,${leaves} 片叶子,${Object.keys(concepts).length} 个概念)`,
);
