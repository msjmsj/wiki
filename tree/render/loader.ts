import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Category,
  ConceptEntry,
  ConceptKind,
  Keyword,
  Leaf,
} from "../types.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const contentDir = join(root, "content");
const conceptsDir = join(root, "concepts");

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

/**
 * 加载概念库:concepts/<kind>/<id>.json,一概念一文件。
 * kind 由目录决定:problem(问题性质)/ solution(解决方案)。
 * problem 概念可有 parent(子性质,如「变化耦合」→「耦合」)。
 */
export function loadConcepts(): Record<string, ConceptEntry> {
  const map: Record<string, ConceptEntry> = {};
  for (const kind of ["problem", "solution"] as ConceptKind[]) {
    const dir = join(conceptsDir, kind);
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort();
    for (const f of files) {
      const id = f.replace(/\.json$/, "");
      if (map[id]) {
        throw new Error(`概念 id 冲突:"${id}" 同时出现在 problem/ 和 solution/`);
      }
      map[id] = { ...readJson<Omit<ConceptEntry, "kind">>(join(dir, f)), kind };
    }
  }
  // 校验父子层级:parent 必须存在、必须是 problem 概念、不允许成环
  for (const [id, c] of Object.entries(map)) {
    if (!c.parent) continue;
    const seen = new Set<string>([id]);
    let cur: ConceptEntry | undefined = c;
    while (cur?.parent) {
      const p = map[cur.parent];
      if (!p) throw new Error(`概念 "${id}" 的 parent "${cur.parent}" 不存在`);
      if (p.kind !== "problem") {
        throw new Error(`概念 "${id}" 的 parent "${cur.parent}" 不是 problem 概念`);
      }
      if (seen.has(cur.parent)) {
        throw new Error(`概念 "${id}" 的 parent 链成环:${cur.parent}`);
      }
      seen.add(cur.parent);
      cur = p;
    }
  }
  return map;
}

function kwId(kw: Keyword): string {
  return typeof kw === "string" ? kw : kw.concept;
}

/** 构建时内容校验:缺字段、引用不存在的概念、标签类型用错,直接报错并指出位置 */
function assertLeaf(
  where: string,
  leaf: Leaf,
  i: number,
  concepts: Record<string, ConceptEntry>,
  used: Set<string>,
): void {
  if (!leaf.symptom || !Array.isArray(leaf.keywords) || leaf.keywords.length === 0) {
    throw new Error(`${where} 第 ${i + 1} 片叶子缺少 symptom 或 keywords`);
  }
  const check = (
    list: Keyword[] | undefined,
    expectKind: ConceptKind,
    field: string,
  ) => {
    (list ?? []).forEach((kw, j) => {
      const id = kwId(kw);
      const c = concepts[id];
      if (!c) {
        throw new Error(`${where} 第 ${i + 1} 片叶子 ${field} 第 ${j + 1} 项引用了不存在的概念 "${id}"`);
      }
      if (c.kind !== expectKind) {
        throw new Error(`${where} 第 ${i + 1} 片叶子 ${field} 第 ${j + 1} 项:"${id}" 是 ${c.kind} 概念,不应出现在 ${field} 里`);
      }
      used.add(id);
      // 子性质被引用时,父概念链一并视为被引用
      let cur: ConceptEntry | undefined = c;
      while (cur?.parent) {
        used.add(cur.parent);
        cur = concepts[cur.parent];
      }
    });
  };
  check(leaf.tags, "problem", "tags");
  check(leaf.keywords, "solution", "keywords");
}

/**
 * 文件结构即注册表:content/<大类>.json = 一个 Category(按文件名排序)。
 * 大类内不再分子分类;渲染时叶子按「主性质」自动聚类。
 * 新增大类只需放一个 JSON 文件,无需改任何代码。
 */
export function loadCategories(
  concepts: Record<string, ConceptEntry>,
): Category[] {
  const used = new Set<string>();
  const files = readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const categories = files.map((f) => {
    const cat = readJson<Category>(join(contentDir, f));
    cat.leaves.forEach((leaf, i) => assertLeaf(`${f}`, leaf, i, concepts, used));
    return cat;
  });

  // GoF 模式概念即使未被树引用,也会被设计模式页收录,不警告
  const unused = Object.keys(concepts).filter(
    (id) => !used.has(id) && !concepts[id].gof,
  );
  if (unused.length > 0) {
    console.warn(`⚠︎ 未被引用的概念:${unused.join(", ")}`);
  }
  return categories;
}
