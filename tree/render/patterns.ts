import type { Category, ConceptEntry, Leaf } from "../types.ts";
import { escapeHtml, leafAnchor } from "./render.ts";

/**
 * 设计模式页:GoF 三分法打底,子组按「被解耦 / 被变化的东西」细分。
 * 布局配置即分类体系;概念文件里的 gof 字段提供内容。
 */

/** 概念 → 树上引用它的叶子(反向链接,页内锚点) */
export type UsageMap = Record<string, { symptom: string; href: string }[]>;

export function buildUsage(categories: Category[]): UsageMap {
  const usage: UsageMap = {};
  categories.forEach((cat) =>
    cat.leaves.forEach((leaf: Leaf, i) => {
      for (const kw of leaf.keywords) {
        const id = typeof kw === "string" ? kw : kw.concept;
        (usage[id] ??= []).push({
          symptom: leaf.symptom,
          href: `#${leafAnchor(cat, leaf, i)}`,
        });
      }
    }),
  );
  return usage;
}

const LAYOUT = [
  {
    title: "创建型",
    sub: "对象怎么来 —— 把「new 什么、怎么 new」从使用方剥离",
    groups: [
      { label: "选实现", desc: "把「创建哪个实现类」的决策从使用方剥离——使用方只面对抽象", ids: ["factory", "abstract-factory"] },
      { label: "组装过程", desc: "复杂对象的构建分步骤进行,构造过程与最终表示分离", ids: ["builder"] },
      { label: "复制", desc: "不重新构造,克隆已有对象得到新实例", ids: ["prototype"] },
      { label: "数量控制", desc: "控制实例的数量(通常为一个),并管理它的访问点", ids: ["controlled-singleton"] },
    ],
  },
  {
    title: "结构型",
    sub: "对象怎么组合与对接",
    groups: [
      { label: "接口对接", desc: "让形状不同的接口能一起工作:转换,或提供统一入口", ids: ["adapter", "facade"] },
      { label: "间接访问", desc: "不直接碰目标对象,经一层代理中转,顺手插手(缓存/校验/翻译)", ids: ["proxy"] },
      { label: "动态叠加", desc: "运行期给对象加行为,不改它的类", ids: ["decorator"] },
      { label: "多维拆分", desc: "两个变化维度各自成树,用组合连接,而非交叉继承", ids: ["bridge"] },
      { label: "树形组合", desc: "个体与组合实现同一接口,客户端无差别对待", ids: ["composite"] },
      { label: "共享减重", desc: "大量细粒度对象共享不变的部分,只传入变化的部分", ids: ["flyweight"] },
    ],
  },
  {
    title: "行为型",
    sub: "对象怎么协作 —— 职责如何在对象间分配与流动",
    groups: [
      { label: "算法替换", desc: "一族算法可互换,选择发生在运行期而非编译期", ids: ["strategy", "template-method"] },
      { label: "请求对象化", desc: "把请求变成对象:可传递、排队、记录、撤销", ids: ["command", "chain-of-responsibility"] },
      { label: "通信解耦", desc: "变化的通知不直连,经订阅机制或中介中转", ids: ["observer", "mediator"] },
      { label: "状态管理", desc: "对象行为随状态改变;状态可保存、可恢复", ids: ["state-machine", "memento"] },
      { label: "遍历访问", desc: "访问聚合结构的元素,而不暴露其内部表示", ids: ["iterator", "visitor"] },
      { label: "语法解释", desc: "为小型语言定义文法并解释执行", ids: ["interpreter"] },
    ],
  },
] as const;

export function renderPatternsBody(
  concepts: Record<string, ConceptEntry>,
  usage: UsageMap,
): string {
  // 校验:带 gof 标记的概念必须在布局里
  const placed = new Set(
    LAYOUT.flatMap((g) => g.groups.flatMap((sg) => sg.ids as readonly string[])),
  );
  const missingIds = Object.keys(concepts).filter(
    (id) => concepts[id].gof && !placed.has(id),
  );
  if (missingIds.length > 0) {
    console.warn(`⚠︎ 带 gof 标记但未排入布局:${missingIds.join(", ")}`);
  }

  const cols = LAYOUT.map((g) => {
    const groups = g.groups
      .map((sg) => {
        const items = sg.ids
          .map((id) => {
            const c = concepts[id];
            if (!c) throw new Error(`布局引用了不存在的概念:${id}`);
            const aka = c.gof?.aka
              ? ` <span class="aka">${escapeHtml(c.gof.aka)}</span>`
              : "";
            const backs = (usage[id] ?? [])
              .slice(0, 3)
              .map(
                (u) =>
                  `<a class="back" href="${escapeHtml(u.href)}">← ${escapeHtml(
                    u.symptom,
                  )}</a>`,
              )
              .join(" ");
            return `      <li class="pat"><span class="pname more" tabindex="0" data-detail="${escapeHtml(
              c.detail,
            )}">${escapeHtml(c.name)}${aka}</span> <span class="intent">${escapeHtml(
              c.gof?.intent ?? "",
            )}</span> ${backs}</li>`;
          })
          .join("\n");
        return `    <div class="psub"><span class="tag fam more" tabindex="0" data-detail="${escapeHtml(
          sg.desc,
        )}">${escapeHtml(sg.label)}</span></div>
    <ul class="pats">
${items}
    </ul>`;
      })
      .join("\n\n");
    return `  <section class="col">
    <h2>${escapeHtml(g.title)}</h2>
    <p class="sub">${escapeHtml(g.sub)}</p>

${groups}
  </section>`;
  }).join("\n\n");

  return `<div class="poster">\n\n${cols}\n\n</div>`;
}
