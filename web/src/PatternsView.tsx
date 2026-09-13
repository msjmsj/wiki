import { useContext } from "react";
import type { ConceptEntry } from "./types.ts";
import type { Usage } from "./util.ts";
import { PATTERN_SECTIONS, PATTERN_KEYS } from "./patterns-layout.ts";
import { ShowConceptContext } from "./ConceptDrawer.tsx";

/**
 * 设计模式视图:分组完全由概念文件的 gof.group / gof.subgroup 自描述,
 * 本组件只按 PATTERN_SECTIONS 的顺序和描述渲染。
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
  // 按「大类/子组」归集
  const bySub = new Map<string, { id: string; c: ConceptEntry }[]>();
  const misplaced: string[] = [];
  for (const [id, c] of Object.entries(concepts)) {
    if (!c.gof) continue;
    const key = `${c.gof.group}/${c.gof.subgroup}`;
    if (!PATTERN_KEYS.has(key)) {
      misplaced.push(`${id}(${key})`);
      continue;
    }
    const arr = bySub.get(key) ?? [];
    arr.push({ id, c });
    bySub.set(key, arr);
  }
  if (misplaced.length)
    console.warn(`⚠︎ gof.group/subgroup 不在注册表:${misplaced.join(", ")}`);

  return (
    <div className="poster">
      {PATTERN_SECTIONS.map((section) => (
        <section className="col" key={section.title}>
          <h2>{section.title}</h2>
          <p className="sub">{section.sub}</p>
          {section.groups.map((sg) => {
            const items = (bySub.get(`${section.title}/${sg.label}`) ?? []).sort(
              (a, b) => a.c.name.localeCompare(b.c.name, "zh"),
            );
            return (
              <div key={sg.label}>
                <div className="psub">
                  <span className="tag fam more" tabIndex={0} data-detail={sg.desc}>
                    {sg.label}
                  </span>
                </div>
                <ul className="pats">
                  {items.map(({ id, c }) => (
                    <li className="pat" key={id}>
                      <PatternName id={id} concept={c} />{" "}
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
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

/** 模式名:点击打开概念卡片(走 ShowConceptContext) */
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
