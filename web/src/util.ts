import type {
  Category,
  ConceptEntry,
  ConceptKind,
  Keyword,
  Leaf,
} from "./types.ts";

export const kwId = (kw: Keyword): string =>
  typeof kw === "string" ? kw : kw.concept;

export const kwNote = (kw: Keyword): string | undefined =>
  typeof kw === "string" ? undefined : kw.note;

/** 沿 parent 链解析到根概念 id(家族聚类用) */
export function rootOf(
  id: string,
  concepts: Record<string, ConceptEntry>,
): string {
  const seen = new Set<string>([id]);
  let cur = id;
  while (concepts[cur]?.parent) {
    const p = concepts[cur].parent!;
    if (seen.has(p)) break;
    seen.add(p);
    cur = p;
  }
  return cur;
}

/** 叶子锚点:显式 id 优先,否则按位置生成 */
export const leafAnchor = (cat: Category, leaf: Leaf, index: number): string =>
  leaf.id ?? `l-${cat.id}-${index}`;

export interface Cluster {
  tagId?: string;
  items: { leaf: Leaf; index: number }[];
}
export interface Family {
  rootId?: string;
  clusters: Cluster[];
}

/** 两级聚类:主性质沿 parent 链归族,族内按直接标签聚子类 */
export function clusterCategory(
  cat: Category,
  concepts: Record<string, ConceptEntry>,
): Family[] {
  const families: Family[] = [];
  cat.leaves.forEach((leaf, index) => {
    const primary = leaf.tags?.[0] ? kwId(leaf.tags[0]) : undefined;
    const root = primary ? rootOf(primary, concepts) : undefined;
    let fam = families.find((f) => f.rootId === root);
    if (!fam) {
      fam = { rootId: root, clusters: [] };
      families.push(fam);
    }
    let cl = fam.clusters.find((c) => c.tagId === primary);
    if (!cl) {
      cl = { tagId: primary, items: [] };
      fam.clusters.push(cl);
    }
    cl.items.push({ leaf, index });
  });
  return families;
}

export interface Usage {
  symptom: string;
  href: string;
}

/** 概念 → 树上引用它的叶子(模式视图反向链接) */
export function buildUsage(
  categories: Category[],
): Record<string, Usage[]> {
  const usage: Record<string, Usage[]> = {};
  categories.forEach((cat) =>
    cat.leaves.forEach((leaf, i) => {
      for (const kw of leaf.keywords) {
        const id = kwId(kw);
        (usage[id] ??= []).push({
          symptom: leaf.symptom,
          href: `#${leafAnchor(cat, leaf, i)}`,
        });
      }
    }),
  );
  return usage;
}
