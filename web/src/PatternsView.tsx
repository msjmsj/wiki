import { useContext } from "react";
import type { ConceptEntry } from "./types.ts";
import type { Usage } from "./util.ts";
import { LAYOUT, PLACED_PATTERN_IDS } from "./patterns-layout.ts";
import { ShowConceptContext } from "./ConceptModal.tsx";

/**
 * 设计模式视图:布局配置在 patterns-layout.ts,内容来自概念库的 gof/detail,
 * 反向链接由 usage 给出(构建期与运行期都会校验完整性)。
 */
export function PatternsView({
  concepts,
  usage,
  onJumpToTree,
}: {
  concepts: Record<string, ConceptEntry>;
  usage: Record<string, Usage[]>;
  onJumpToTree: () => void;
}) {
  const missing = Object.keys(concepts).filter(
    (id) =>
      (concepts[id].gof || concepts[id].level === "pattern") &&
      !PLACED_PATTERN_IDS.has(id),
  );
  if (missing.length)
    console.warn(`⚠︎ 模式概念未排入布局:${missing.join(", ")}`);

  return (
    <div className="poster">
      {LAYOUT.map((g) => (
        <section className="col" key={g.title}>
          <h2>{g.title}</h2>
          <p className="sub">{g.sub}</p>
          {g.groups.map((sg) => (
            <div key={sg.label}>
              <div className="psub">
                <span className="tag fam more" tabIndex={0} data-detail={sg.desc}>
                  {sg.label}
                </span>
              </div>
              <ul className="pats">
                {sg.ids.map((id) => {
                  const c = concepts[id];
                  if (!c) throw new Error(`布局引用了不存在的概念:${id}`);
                  return (
                    <li className="pat" key={id}>
                      <PatternName id={id} concept={c} />
                      <span className="intent">{c.gof?.intent}</span>{" "}
                      {(usage[id] ?? []).slice(0, 3).map((u, i) => (
                        <a
                          key={i}
                          className="back"
                          href={u.href}
                          onClick={onJumpToTree}
                        >
                          ← {u.symptom}
                        </a>
                      ))}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function PatternName({
  id,
  concept,
}: {
  id: string;
  concept: ConceptEntry;
}) {
  const show = useContext(ShowConceptContext);
  return (
    <span
      className="pname"
      role="button"
      tabIndex={0}
      onClick={() => show(id)}
      onKeyDown={(e) => e.key === "Enter" && show(id)}
    >
      {concept.name}
      {concept.gof?.aka && <span className="aka">{concept.gof.aka}</span>}
    </span>
  );
}
