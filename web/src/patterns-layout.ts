/**
 * 设计模式视图的布局配置:GoF 三分法 + 扩展模式,子组按「被解耦/被变化的东西」细分。
 * 独立成纯 TS 模块,供 PatternsView(浏览器)和 check.ts(构建校验)共用。
 */
export interface PatternGroup {
  label: string;
  desc: string;
  ids: string[];
}
export interface PatternSection {
  title: string;
  sub: string;
  groups: PatternGroup[];
}

export const LAYOUT: PatternSection[] = [
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
  {
    title: "扩展模式",
    sub: "GoF 之外、但被业界广泛命名的模式(分层、管道、防腐……)",
    groups: [
      { label: "架构与装配", desc: "系统级的结构划分与对象装配方式", ids: ["layering", "functional-core", "di"] },
      { label: "通信与边界", desc: "跨进程 / 跨系统协作的通道与防线", ids: ["middleware", "pubsub", "acl"] },
      { label: "演进与溯源", desc: "系统如何随时间安全地变化和回溯", ids: ["strangler", "event-sourcing"] },
    ],
  },
];

/** 已排入布局的模式 id 集合(校验用):任何 level=pattern / 带 gof 的概念都必须在这里 */
export const PLACED_PATTERN_IDS: ReadonlySet<string> = new Set(
  LAYOUT.flatMap((s) => s.groups.flatMap((g) => g.ids)),
);
