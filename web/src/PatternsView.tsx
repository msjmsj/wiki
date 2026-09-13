import type { ConceptEntry } from "./types";
import type { Usage } from "./util";

/**
 * 设计模式视图:GoF 三分法打底,子组按「被解耦 / 被变化的东西」细分。
 * LAYOUT 即分类体系;概念文件里的 gof 字段提供内容;反向链接由 usage 给出。
 */
const LAYOUT: {
  title: string;
  sub: string;
  groups: { label: string; desc: string; ids: string[] }[];
}[] = [
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
];

export function PatternsView({
  concepts,
  usage,
  onJumpToTree,
}: {
  concepts: Record<string, ConceptEntry>;
  usage: Record<string, Usage[]>;
  onJumpToTree: () => void;
}) {
  // 带 gof 标记但未排入布局 → 警告
  const placed = new Set(LAYOUT.flatMap((g) => g.groups.flatMap((sg) => sg.ids)));
  const missing = Object.keys(concepts).filter(
    (id) => concepts[id].gof && !placed.has(id),
  );
  if (missing.length) console.warn(`⚠︎ 带 gof 标记但未排入布局:${missing.join(", ")}`);

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
                      <span className="pname more" tabIndex={0} data-detail={c.detail}>
                        {c.name}
                        {c.gof?.aka && <span className="aka">{c.gof.aka}</span>}
                      </span>{" "}
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
