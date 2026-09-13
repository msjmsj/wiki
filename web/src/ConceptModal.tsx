import { createContext, useEffect } from "react";
import type { ConceptEntry, SolutionLevel } from "./types";
import type { Usage } from "./util";

/** Tag 点击时打开概念卡片 */
export const ShowConceptContext = createContext<
  (id: string, note?: string) => void
>(() => {});

const LEVEL_LABEL: Record<SolutionLevel, string> = {
  principle: "原则",
  pattern: "设计模式",
  mechanism: "机制",
};

/** 段首「标签:」加粗为小节锚点,如「定义:」「常见错误:」 */
function DocParagraph({ text }: { text: string }) {
  const m = /^([^:：\n]{1,10})[:：]([\s\S]*)$/.exec(text);
  if (!m) return <p>{text}</p>;
  return (
    <p>
      <span className="m-label">{m[1]}</span>
      {m[2]}
    </p>
  );
}

/**
 * 概念卡片(Modal):简明讲解 + 详细讲解(doc)+ 出现于哪些叶子(可跳转)。
 * Esc / 点击遮罩关闭。
 */
export function ConceptModal({
  id,
  note,
  concepts,
  usage,
  onClose,
  onJumpToTree,
}: {
  id: string;
  note?: string;
  concepts: Record<string, ConceptEntry>;
  usage?: Usage[];
  onClose: () => void;
  onJumpToTree: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const c = concepts[id];
  if (!c) return null;
  const level =
    c.kind === "solution"
      ? (c.level ?? (c.gof ? "pattern" : "mechanism"))
      : undefined;
  const parent = c.parent ? concepts[c.parent] : undefined;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-head">
          <span className="m-name">{c.name}</span>
          {c.kind === "problem" && <span className="m-badge">问题性质</span>}
          {level && <span className="m-badge">{LEVEL_LABEL[level]}</span>}
          {parent && <span className="m-badge">{parent.name} 的一种</span>}
          {c.gof?.aka && <span className="m-badge">{c.gof.aka}</span>}
          <button className="m-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        {note && <p className="m-note">本处角色:{note}</p>}
        <p className="m-detail">{c.detail}</p>
        {c.doc && (
          <div className="m-doc">
            {c.doc.split("\n\n").map((p, i) => (
              <DocParagraph key={i} text={p} />
            ))}
          </div>
        )}
        {usage && usage.length > 0 && (
          <div className="m-backs">
            出现在:
            {usage.map((u, i) => (
              <a
                key={i}
                href={u.href}
                onClick={(e) => {
                  e.preventDefault();
                  onJumpToTree();
                  onClose();
                  location.hash = u.href;
                }}
              >
                {u.symptom}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
