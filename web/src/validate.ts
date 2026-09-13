import type { Category, ConceptEntry, ConceptKind, Keyword } from "./types";
import { kwId } from "./util";

/** 与 tree/render/loader.ts 同规则的数据校验;错误抛出,警告进 console */
export function validate(
  categories: Category[],
  concepts: Record<string, ConceptEntry>,
): void {
  // parent:必须存在、必须是 problem、不允许成环
  for (const [id, c] of Object.entries(concepts)) {
    if (!c.parent) continue;
    const seen = new Set<string>([id]);
    let cur: ConceptEntry | undefined = c;
    while (cur?.parent) {
      const p: ConceptEntry | undefined = concepts[cur.parent];
      if (!p) throw new Error(`概念 "${id}" 的 parent "${cur.parent}" 不存在`);
      if (p.kind !== "problem")
        throw new Error(`概念 "${id}" 的 parent "${cur.parent}" 不是 problem 概念`);
      if (seen.has(cur.parent))
        throw new Error(`概念 "${id}" 的 parent 链成环:${cur.parent}`);
      seen.add(cur.parent);
      cur = p;
    }
  }

  const used = new Set<string>();
  for (const cat of categories) {
    cat.leaves.forEach((leaf, i) => {
      const where = `${cat.id} 第 ${i + 1} 片叶子`;
      if (!leaf.symptom || !leaf.keywords?.length) {
        throw new Error(`${where} 缺少 symptom 或 keywords`);
      }
      const check = (
        list: Keyword[] | undefined,
        kind: ConceptKind,
        field: string,
      ) =>
        (list ?? []).forEach((kw, j) => {
          const id = kwId(kw);
          const c = concepts[id];
          if (!c) throw new Error(`${where} ${field}[${j}] 引用了不存在的概念 "${id}"`);
          if (c.kind !== kind)
            throw new Error(`${where} ${field}[${j}]:"${id}" 是 ${c.kind} 概念,不应出现在 ${field}`);
          used.add(id);
          let cur: ConceptEntry | undefined = c;
          while (cur?.parent) {
            used.add(cur.parent);
            cur = concepts[cur.parent];
          }
        });
      check(leaf.tags, "problem", "tags");
      check(leaf.keywords, "solution", "keywords");
    });
  }

  const unused = Object.keys(concepts).filter(
    (id) => !used.has(id) && !concepts[id].gof,
  );
  if (unused.length) console.warn(`⚠︎ 未被引用的概念:${unused.join(", ")}`);
}
