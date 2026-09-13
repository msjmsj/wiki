import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { categories, concepts } from "./data";
import { buildUsage } from "./util";
import { TreeView } from "./TreeView";
import { PatternsView } from "./PatternsView";
import { ConceptDrawer, ShowConceptContext } from "./ConceptDrawer.tsx";

const usage = buildUsage(categories);

type ViewKey = "tree" | "patterns";
const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "tree", label: "分化树" },
  { key: "patterns", label: "设计模式" },
];

export default function App() {
  const [view, setView] = useState<ViewKey>("tree");
  const [active, setActive] = useState<{ id: string; note?: string } | null>(null);

  // 两个视图都挂载,显隐由 body[data-view] 的 CSS 控制:
  // 页内锚点跳转(#legacy-code 等)因此始终有效
  useEffect(() => {
    document.body.dataset.view = view;
  }, [view]);

  // 跳回树视图:flushSync 确保 DOM 显隐先更新,之后浏览器再处理锚点滚动
  const jumpToTree = () => flushSync(() => setView("tree"));

  // 空白处点击收回侧栏;点在胶囊/症状上等可交互元素上不影响切换
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => {
      const el = e.target as Element;
      if (el.closest(".drawer") || el.closest(".kw, .tag, .pname, .sym.more")) return;
      setActive(null);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [active]);

  return (
    <ShowConceptContext.Provider
      // 再点同一个胶囊 = 收起(开关式)
      value={(id, note) =>
        setActive((cur) => (cur?.id === id ? null : { id, note }))
      }
    >
      <nav className="views">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            className={view === v.key ? "active" : ""}
            onClick={() => setView(v.key)}
          >
            {v.label}
          </button>
        ))}
      </nav>
      <div className="view view-tree">
        <TreeView categories={categories} concepts={concepts} />
      </div>
      <div className="view view-patterns">
        <PatternsView
          concepts={concepts}
          usage={usage}
          onJumpToTree={jumpToTree}
        />
      </div>
      {active && (
        <ConceptDrawer
          id={active.id}
          note={active.note}
          concepts={concepts}
          usage={usage[active.id]}
          onClose={() => setActive(null)}
          onJumpToTree={jumpToTree}
        />
      )}
    </ShowConceptContext.Provider>
  );
}
