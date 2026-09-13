import type { Category, ConceptEntry, ConceptKind, Keyword } from "./types.ts";
import { kwId } from "./util.ts";

const DETAIL_MAX = 80; // 速记提示长度上限(字)

/** 内容规范的机械检查(写进 README 的规则必须能落到工具里) */
function lintConcept(
  id: string,
  c: ConceptEntry,
  warnings: string[],
): void {
  if (c.detail.length > DETAIL_MAX) {
    warnings.push(`${id}: detail 超长(${c.detail.length} 字,上限 ${DETAIL_MAX})`);
  }
  if (c.detail.startsWith("TODO") || (c.gof?.intent ?? "").startsWith("TODO")) {
    warnings.push(`${id}: 含脚手架 TODO 占位,记得补写`);
  }
  if (c.doc?.includes("TODO")) {
    warnings.push(`${id}: doc 含 TODO 占位小节,记得补写`);
  }
  if (!c.doc) return;
  if (c.doc.includes(c.detail)) {
    warnings.push(`${id}: doc 完整复读了 detail`);
  } else {
    // 句子级复读检测:detail 分句后,超过 12 字的句子不得在 doc 中原文出现
    for (const seg of c.detail.split(/[。;]/)) {
      const s = seg.trim();
      if (s.length >= 12 && c.doc.includes(s)) {
        warnings.push(`${id}: doc 复读 detail 的句子「${s.slice(0, 16)}…」`);
      }
    }
  }
  // doc 是 Markdown:必须以 ### 小节开头;不得残留旧式「标签:」段落(未迁移)
  if (!c.doc.startsWith("### ")) {
    warnings.push(`${id}: doc 须以「### 小节标题」开头`);
  }
  // 剥掉代码块和小节标题后再查旧式段落(避免误报 mermaid 图里的「节点:文本」)
  const prose = c.doc
    .replaceAll(/```[\s\S]*?```/g, "")
    .replaceAll(/^### .*$/gm, "");
  if (/^「?[^:：\n]{1,12}[:：]/m.test(prose)) {
    warnings.push(`${id}: doc 含有旧式「标签:」段落,应改为 ### 小节`);
  }
}

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
  const warnings: string[] = [];
  for (const [id, c] of Object.entries(concepts)) lintConcept(id, c, warnings);
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
  if (unused.length) warnings.push(`未被引用的概念:${unused.join(", ")}`);
  if (warnings.length) {
    console.warn(`内容规范检查:\n${warnings.map((w) => `  ⚠︎ ${w}`).join("\n")}`);
  }
}
