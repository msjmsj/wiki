import type { ConceptEntry, Keyword } from "./types";
import { kwId, kwNote } from "./util";

/**
 * 概念标签胶囊:点击(聚焦)弹出解释,点别处消失(纯 CSS)。
 * 弹层 = 叶子 note(本处角色,可选)+ 父概念归属(可选)+ 概念 detail。
 */
export function Tag({
  kw,
  concepts,
  cls,
}: {
  kw: Keyword;
  concepts: Record<string, ConceptEntry>;
  cls: "tag" | "kw" | "tag fam";
}) {
  const id = kwId(kw);
  const note = kwNote(kw);
  const c = concepts[id];
  if (!c) throw new Error(`概念未定义:${id}`);
  const parts: string[] = [];
  if (note) parts.push(note);
  if (c.parent && concepts[c.parent])
    parts.push(`【${concepts[c.parent].name} 的一种】`);
  parts.push(c.detail);
  return (
    <span className={`${cls} more`} tabIndex={0} data-detail={parts.join("\n\n")}>
      {c.name}
    </span>
  );
}
