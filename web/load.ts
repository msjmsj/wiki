/** Node 端共享数据加载(check.ts / new.ts 共用) */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Category, ConceptEntry, ConceptKind } from "./src/types.ts";

export const treeDir = fileURLToPath(new URL("../tree/", import.meta.url));

export const readJson = <T>(p: string): T =>
  JSON.parse(readFileSync(p, "utf8")) as T;

export const writeJson = (p: string, data: unknown): void =>
  writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");

export function loadAll(): {
  categories: Category[];
  concepts: Record<string, ConceptEntry>;
} {
  const categories: Category[] = readdirSync(join(treeDir, "content"))
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => readJson<Category>(join(treeDir, "content", f)));

  const concepts: Record<string, ConceptEntry> = {};
  for (const kind of ["problem", "solution"] as ConceptKind[]) {
    const dir = join(treeDir, "concepts", kind);
    for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const id = f.replace(/\.json$/, "");
      concepts[id] = { ...readJson<object>(join(dir, f)), kind } as ConceptEntry;
    }
  }
  return { categories, concepts };
}
