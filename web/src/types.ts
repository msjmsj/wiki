/**
 * 内容模型:问题 → 方案 分化树(与 tree/types.ts 一致)
 */

export type ConceptKind = "problem" | "solution";

export interface GofInfo {
  intent: string;
  aka?: string;
}

export interface Concept {
  name: string;
  detail: string;
  parent?: string;
  gof?: GofInfo;
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
