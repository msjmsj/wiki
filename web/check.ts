/**
 * Node 端数据校验:vite build 只打包不执行模块,所以校验要在这里单独跑。
 * 与浏览器端 data.ts 共用同一份 validate 规则。
 * 用法:npm run check(已内置进 build 流程)
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "./src/validate.ts";
import { PATTERN_KEYS } from "./src/patterns-layout.ts";
import type { Category, ConceptEntry, ConceptKind } from "./src/types.ts";

const treeDir = fileURLToPath(new URL("../tree/", import.meta.url));

const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;

const categories: Category[] = readdirSync(join(treeDir, "content"))
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => readJson<Category>(join(treeDir, "content", f)));

const concepts: Record<string, ConceptEntry> = {};
for (const kind of ["problem", "solution"] as ConceptKind[]) {
  const dir = join(treeDir, "concepts", kind);
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const id = f.replace(/\.json$/, "");
    concepts[id] = { ...readJson<object>(join(dir, f)), kind } as ConceptEntry;
  }
}

validate(categories, concepts);

// 布局完整性:level=pattern 的概念必须带 gof;gof.group/subgroup 必须在注册表里
for (const [id, c] of Object.entries(concepts)) {
  if (c.kind !== "solution") continue;
  if (c.level === "pattern" && !c.gof) {
    console.warn(`⚠︎ ${id}: level=pattern 但缺 gof 字段(不会出现在模式页)`);
    continue;
  }
  if (c.gof && !PATTERN_KEYS.has(`${c.gof.group}/${c.gof.subgroup}`)) {
    console.warn(
      `⚠︎ ${id}: gof.group/subgroup「${c.gof.group}/${c.gof.subgroup}」不在注册表 patterns-layout.ts`,
    );
  }
}

console.log(
  `✓ 数据校验通过(${categories.length} 个大类,${categories.reduce((n, c) => n + c.leaves.length, 0)} 片叶子,${Object.keys(concepts).length} 个概念)`,
);
