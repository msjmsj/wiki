/**
 * 内容模型:问题 → 方案 分化树(与 tree/types.ts 一致)
 */

export type ConceptKind = "problem" | "solution";

export interface GofInfo {
  intent: string;
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
