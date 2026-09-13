/**
 * 设计模式视图的板块/子组注册表:只定义「有哪些大类、哪些子组、顺序和描述」,
 * 不登记概念 id——归属由概念文件的 gof.group / gof.subgroup 自描述。
 * 只有新增大类或子组时才需要改这里。
 */
export interface SubgroupMeta {
  label: string;
  desc: string;
}
export interface SectionMeta {
  title: string;
  sub: string;
  groups: SubgroupMeta[];
}

export const PATTERN_SECTIONS: SectionMeta[] = [
  {
    title: "创建型",
    sub: "对象怎么来 —— 把「new 什么、怎么 new」从使用方剥离",
    groups: [
      { label: "选实现", desc: "把「创建哪个实现类」的决策从使用方剥离——使用方只面对抽象" },
      { label: "组装过程", desc: "复杂对象的构建分步骤进行,构造过程与最终表示分离" },
      { label: "复制", desc: "不重新构造,克隆已有对象得到新实例" },
      { label: "数量控制", desc: "控制实例的数量(通常为一个),并管理它的访问点" },
    ],
  },
  {
    title: "结构型",
    sub: "对象怎么组合与对接",
    groups: [
      { label: "接口对接", desc: "让形状不同的接口能一起工作:转换,或提供统一入口" },
      { label: "间接访问", desc: "不直接碰目标对象,经一层代理中转,顺手插手(缓存/校验/翻译)" },
      { label: "动态叠加", desc: "运行期给对象加行为,不改它的类" },
      { label: "多维拆分", desc: "两个变化维度各自成树,用组合连接,而非交叉继承" },
      { label: "树形组合", desc: "个体与组合实现同一接口,客户端无差别对待" },
      { label: "共享减重", desc: "大量细粒度对象共享不变的部分,只传入变化的部分" },
    ],
  },
  {
    title: "行为型",
    sub: "对象怎么协作 —— 职责如何在对象间分配与流动",
    groups: [
      { label: "算法替换", desc: "一族算法可互换,选择发生在运行期而非编译期" },
      { label: "请求对象化", desc: "把请求变成对象:可传递、排队、记录、撤销" },
      { label: "通信解耦", desc: "变化的通知不直连,经订阅机制或中介中转" },
      { label: "状态管理", desc: "对象行为随状态改变;状态可保存、可恢复" },
      { label: "遍历访问", desc: "访问聚合结构的元素,而不暴露其内部表示" },
      { label: "语法解释", desc: "为小型语言定义文法并解释执行" },
    ],
  },
  {
    title: "扩展模式",
    sub: "GoF 之外、但被业界广泛命名的模式(分层、管道、防腐……)",
    groups: [
      { label: "架构与装配", desc: "系统级的结构划分与对象装配方式" },
      { label: "通信与边界", desc: "跨进程 / 跨系统协作的通道与防线" },
      { label: "演进与溯源", desc: "系统如何随时间安全地变化和回溯" },
    ],
  },
];

/** 合法的「大类/子组」键集合(校验用) */
export const PATTERN_KEYS: ReadonlySet<string> = new Set(
  PATTERN_SECTIONS.flatMap((s) => s.groups.map((g) => `${s.title}/${g.label}`)),
);
