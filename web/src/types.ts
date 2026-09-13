/**
 * 内容模型:问题 → 方案 分化树(与 tree/types.ts 一致)
 */

export type ConceptKind = "problem" | "solution";

export interface GofInfo {
  /** 大类:创建型 / 结构型 / 行为型 / 扩展模式(见 patterns-layout.ts 的 PATTERN_SECTIONS) */
  group: string;
  /** 子组标签,如 "接口对接"(须存在于所属大类的子组注册表) */
  subgroup: string;
  /** 一句话意图(GoF 经典表述) */
  intent: string;
  /** GoF 原名/别名(显示名与 GoF 名不同时用),如 "工厂方法 Factory Method" */
  aka?: string;
}

export type SolutionLevel = "principle" | "pattern" | "mechanism";

export interface Concept {
  name: string;
  detail: string;
  parent?: string;
  gof?: GofInfo;
  /**
   * 方案层级(仅 solution 概念):原则 / 设计模式 / 机制。
   * 缺省时:带 gof 字段 → pattern,否则 → mechanism。
   */
  level?: SolutionLevel;
  /** 详细讲解(可选):多段落用 \n\n 分隔,点击概念卡片中展示 */
  doc?: string;
}

export interface ConceptEntry extends Concept {
  kind: ConceptKind;
}

export type Keyword = string | { concept: string; note?: string };

export interface Leaf {
  id?: string;
  symptom: string;
  symptomNote?: string;
  tags?: Keyword[];
  keywords: Keyword[];
  warning?: string;
  xref?: { target: string; text: string };
}

export interface Category {
  id: string;
  title: string;
  subtitle: string;
  leaves: Leaf[];
}
