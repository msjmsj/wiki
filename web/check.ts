/** 数据校验:加载 → validate → 布局完整性检查。被 cli.ts 调用。 */
import { loadAll } from "./load.ts";
import { validate } from "./src/validate.ts";
import { PATTERN_KEYS } from "./src/patterns-layout.ts";

export function runCheck(): void {
  const { categories, concepts } = loadAll();
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
}
