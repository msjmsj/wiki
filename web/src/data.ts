import type { Category, ConceptEntry, ConceptKind } from "./types";
import { validate } from "./validate";

/**
 * 数据层:直接读取 tree/ 下的 JSON 文件(单一数据源)。
 * content/<大类>.json → Category;concepts/<kind>/<id>.json → ConceptEntry。
 * 加载即校验:错误在 dev / build 时直接抛出。
 */
const contentMods = import.meta.glob("../../tree/content/*.json", {
  eager: true,
  import: "default",
});
const conceptMods = import.meta.glob("../../tree/concepts/*/*.json", {
  eager: true,
  import: "default",
});
// 同名 .md 文件 = 概念的详细讲解(Markdown 原文)
const docMods = import.meta.glob("../../tree/concepts/*/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

export const categories: Category[] = Object.keys(contentMods)
  .sort()
  .map((k) => contentMods[k] as Category);

export const concepts: Record<string, ConceptEntry> = {};
for (const [path, mod] of Object.entries(conceptMods)) {
  const m = /concepts\/(problem|solution)\/([^/]+)\.json$/.exec(path);
  if (!m) continue;
  concepts[m[2]] = { ...(mod as object), kind: m[1] as ConceptKind } as ConceptEntry;
}
for (const [path, raw] of Object.entries(docMods)) {
  const m = /concepts\/(?:problem|solution)\/([^/]+)\.md$/.exec(path);
  if (m && concepts[m[1]]) concepts[m[1]].doc = (raw as string).trim();
}

validate(categories, concepts);
