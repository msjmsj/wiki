import type { Category, ConceptEntry, Keyword, Leaf } from "../types.ts";

/** HTML 转义(内容里出现的 & < > " 都需要处理) */
export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** 概念 id(字符串引用或 { concept } 对象引用) */
function kwId(kw: Keyword): string {
  return typeof kw === "string" ? kw : kw.concept;
}

/** 叶子的页内锚点:显式 id 优先,否则按位置确定性生成 */
export function leafAnchor(cat: Category, leaf: Leaf, index: number): string {
  return leaf.id ?? `l-${cat.id}-${index}`;
}

/**
 * 标签 = 概念引用。
 * 弹层 = 叶子 note(本处角色,可选)+ 父概念归属(可选)+ 概念通用 detail。
 * cls:"tag"(问题性质,实心灰块)/ "kw"(方案,空心胶囊)
 */
function renderKeyword(
  kw: Keyword,
  concepts: Record<string, ConceptEntry>,
  cls: "tag" | "kw",
): string {
  const id = kwId(kw);
  const note = typeof kw === "string" ? undefined : kw.note;
  const c = concepts[id];
  if (!c) throw new Error(`概念未定义:${id}`);
  const parts: string[] = [];
  if (note) parts.push(note);
  if (c.parent) {
    const p = concepts[c.parent];
    if (p) parts.push(`【${p.name} 的一种】`);
  }
  parts.push(c.detail);
  return `<span class="${cls} more" tabindex="0" data-detail="${escapeHtml(
    parts.join("\n\n"),
  )}">${escapeHtml(c.name)}</span>`;
}

function renderLeaf(
  leaf: Leaf,
  concepts: Record<string, ConceptEntry>,
  anchor: string,
  visibleTags: Keyword[],
): string {
  // 有补充说明的问题表现:可点击(虚线下划线提示),点击弹出说明
  const symText = escapeHtml(leaf.symptom);
  const sym = leaf.symptomNote
    ? `<span class="sym more" tabindex="0" data-detail="${escapeHtml(
        leaf.symptomNote,
      )}">${symText}</span>`
    : `<span class="sym">${symText}</span>`;
  const tags = visibleTags
    .map((t) => renderKeyword(t, concepts, "tag"))
    .join("");
  const xref = leaf.xref
    ? `<a class="xref" href="${escapeHtml(leaf.xref.target)}">${escapeHtml(
        leaf.xref.text,
      )}</a>`
    : "";
  const kws = leaf.keywords
    .map((kw) => renderKeyword(kw, concepts, "kw"))
    .join("");
  const tip = leaf.warning
    ? `<span class="tip" data-tip="${escapeHtml(leaf.warning)}">⚠︎</span>`
    : "";
  return `        <li id="${anchor}">${sym}${tags}${xref}<span class="arrow">→</span>${kws}${tip}</li>`;
}

/** 沿 parent 链解析到根概念 id(用于家族聚类) */
function rootOf(id: string, concepts: Record<string, ConceptEntry>): string {
  const seen = new Set<string>([id]);
  let cur = id;
  while (concepts[cur]?.parent) {
    const p = concepts[cur].parent!;
    if (seen.has(p)) break; // 成环已在 loader 拦下,这里兑底
    seen.add(p);
    cur = p;
  }
  return cur;
}

interface Cluster {
  tagId?: string;
  items: { leaf: Leaf; index: number }[];
}

export function renderCategory(
  cat: Category,
  concepts: Record<string, ConceptEntry>,
): string {
  // 两级聚类:主性质沿 parent 链解析到根概念(家族),家族内再按直接标签聚子类。
  // 首次出现顺序即展示顺序。
  const families: { rootId?: string; clusters: Cluster[] }[] = [];
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

  const renderLeaves = (c: Cluster) =>
    c.items
      .map(({ leaf, index }) =>
        renderLeaf(
          leaf,
          concepts,
          leafAnchor(cat, leaf, index),
          c.tagId ? (leaf.tags ?? []).slice(1) : (leaf.tags ?? []),
        ),
      )
      .join("\n");

  const body = families
    .map((fam) => {
      const famHead = fam.rootId
        ? `    <h4>${renderKeyword(fam.rootId, concepts, "tag fam")}</h4>\n`
        : "";
      // 家族只有一类且就是根概念本身 → 单层;否则根为家族头,子类缩进一级
      const flat =
        fam.clusters.length === 1 && fam.clusters[0]!.tagId === fam.rootId;
      if (flat || !fam.rootId) {
        return `    <div class="fam">
${famHead}    <ul class="leaves">
${renderLeaves(fam.clusters[0]!)}
    </ul>
    </div>`;
      }
      const subs = fam.clusters
        .map((c) => {
          // 直接挂在根概念下的叶子(未细分子性质)不带子标题
          const subHead =
            c.tagId && c.tagId !== fam.rootId
              ? `      <h5>${renderKeyword(c.tagId, concepts, "tag")}</h5>\n`
              : "";
          return `      <div class="cluster">
${subHead}      <ul class="leaves">
${renderLeaves(c)}
      </ul>
      </div>`;
        })
        .join("\n");
      return `    <div class="fam">
${famHead}${subs}
    </div>`;
    })
    .join("\n\n");

  return `  <!-- ═══ ${escapeHtml(cat.title)} ═══ -->
  <section class="col" id="${escapeHtml(cat.id)}">
    <h2>${escapeHtml(cat.title)}</h2>
    <p class="sub">${escapeHtml(cat.subtitle)}</p>

${body}
  </section>`;
}
