import { useEffect, useState } from "react";
import { categories, concepts } from "./data";
import { buildUsage } from "./util";
import { TreeView } from "./TreeView";
import { PatternsView } from "./PatternsView";

const usage = buildUsage(categories);

type ViewKey = "tree" | "patterns";
const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "tree", label: "分化树" },
  { key: "patterns", label: "设计模式" },
];

export default function App() {
  const [view, setView] = useState<ViewKey>("tree");

  // 两个视图都挂载,显隐由 body[data-view] 的 CSS 控制:
  // 页内锚点跳转(#legacy-code 等)因此始终有效,无需等重渲染
  useEffect(() => {
    document.body.dataset.view = view;
  }, [view]);

  return (
    <>
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
          onJumpToTree={() => setView("tree")}
        />
      </div>
    </>
  );
}
