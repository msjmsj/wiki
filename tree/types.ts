/**
 * 内容模型:问题 → 方案 分化树
 *
 * 层级:Category(大类,如 A 认知类)
 *       └─ Leaf(叶子:问题表现 + 性质标签 + 方案关键字)
 *          渲染时叶子按「主性质」(tags[0])自动聚类成小类
 *
 * 每个标签 = 一个概念,权威定义在 concepts/<kind>/<id>.json(一概念一文件);
 * 叶子里只引用概念 id,避免同一概念在多处重复定义、各自漂移。
 */

export type ConceptKind = "problem" | "solution";

/** GoF 模式信息(可选)。有此字段的概念会出现在设计模式页 */
export interface GofInfo {
  /** 一句话意图(GoF 经典表述) */
  intent: string;
  /** GoF 原名/别名(显示名与 GoF 名不同时用),如 "工厂方法 Factory Method" */
  aka?: string;
}

/** 概念:权威定义(concepts/<kind>/<id>.json,一概念一文件) */
export interface Concept {
  /** 标签显示名,如 "不可变" */
  name: string;
  /** 通用解释:是什么 + 怎么做 / 怎么识别(不绑定任何具体叶子) */
  detail: string;
  /**
   * 父概念 id(可选,仅 problem 概念使用)。
   * 如「变化耦合」的 parent 是「耦合」——同一家族,痛的时机/场景不同。
   * 叶子引用子性质,父概念自动视为被引用。
   */
  parent?: string;
  /** GoF 模式信息(可选,仅 solution 概念) */
  gof?: GofInfo;
}

/** 加载后的概念,kind 由所在目录(problem/ 或 solution/)决定 */
export interface ConceptEntry extends Concept {
  kind: ConceptKind;
}

/**
 * 叶子上的标签 = 对概念库中概念的引用。
 * - 纯字符串:概念 id(与 concepts/ 下的文件名一致,不带 .json)
 * - { concept, note }:note 说明该概念在「这片叶子」里的角色/侧重点,
 *   与概念通用 detail 一起显示(note 在前)。
 */
export type Keyword = string | { concept: string; note?: string };

/** 一片叶子:一个问题表现 + 问题性质标签 + 方案概念标签 */
export interface Leaf {
  /** 页内锚点(可选)。需要被交叉引用指向的叶子设一个稳定 id,如 "legacy-code" */
  id?: string;
  /** 问题表现(加粗,扫读入口) */
  symptom: string;
  /** 表现的补充说明(可选;带说明的表现有虚线下划线,点击弹出) */
  symptomNote?: string;
  /**
   * 问题性质标签(引用 concepts/problem/,可指向子性质)。
   * 第一个 = 主性质:大类内按它聚类成小类,行上不再重复显示;
   * 其余为次要性质,保留在行上。
   */
  tags?: Keyword[];
  /** 方案关键字(引用 concepts/solution/),至少一个 */
  keywords: Keyword[];
  /** ⚠︎ 叶子级注意事项(hover 浮层,可选) */
  warning?: string;
  /** 交叉引用:该表现也出现在其他大类(可选) */
  xref?: {
    /** 目标叶子的 id,如 "#legacy-code" */
    target: string;
    /** 链接文字,如 "⇢ 另一根源在 C" */
    text: string;
  };
}

/** 一个大类(板块),如 A 认知类。一个大类 = content/ 下一个 JSON 文件 */
export interface Category {
  /** 锚点 id,如 "a" */
  id: string;
  /** 板块标题,如 "A. 认知类问题" */
  title: string;
  /** 板块副标题(隐含第一层分类维度:谁受影响) */
  subtitle: string;
  leaves: Leaf[];
}
