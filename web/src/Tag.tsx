import { useContext } from "react";
import type { ConceptEntry, Keyword } from "./types";
import { kwId, kwNote } from "./util";
import { ShowConceptContext } from "./ConceptDrawer.tsx";

/**
 * 概念标签胶囊:点击打开概念卡片(简明讲解 + 详细讲解 + 出处链接)。
 * 样式:问题=实心灰块;方案按层级分——原则=空心细边,模式=深色粗边,机制=浅灰实心。
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
  const show = useContext(ShowConceptContext);
  const id = kwId(kw);
  const note = kwNote(kw);
  const c = concepts[id];
  if (!c) throw new Error(`概念未定义:${id}`);

  const level =
    c.kind === "solution"
      ? (c.level ?? (c.gof ? "pattern" : "mechanism"))
      : undefined;

  return (
    <span
      className={`${cls}${level ? ` ${level}` : ""}`}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        show(id, note);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") show(id, note);
      }}
    >
      {c.name}
    </span>
  );
}
