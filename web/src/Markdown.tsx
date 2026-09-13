import { useEffect, useMemo, useRef } from "react";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: false, linkify: true });

let mermaidSeq = 0;

/**
 * Markdown 渲染器(doc 字段用)。
 * - 标准 Markdown:标题、加粗、代码块、列表、链接
 * - ```mermaid 代码块懒加载渲染成图(只在用到时才下载 mermaid)
 */
export function Markdown({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => md.render(text), [text]);

  useEffect(() => {
    const blocks = ref.current?.querySelectorAll("pre > code.language-mermaid");
    if (!blocks?.length) return;
    let cancelled = false;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        fontFamily: "inherit",
      });
      for (const code of Array.from(blocks)) {
        const pre = code.parentElement!;
        try {
          const { svg } = await mermaid.render(
            `mmd-${++mermaidSeq}`,
            code.textContent ?? "",
          );
          if (cancelled) return;
          const div = document.createElement("div");
          div.className = "mermaid";
          div.innerHTML = svg;
          pre.replaceWith(div);
        } catch {
          // 语法错误就保留原始代码块,不让卡片崩掉
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div ref={ref} className="md" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
