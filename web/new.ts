/**
 * 内容脚手架:让正路比野路快。由 cli.ts 调用。
 *   new concept --kind solution --id xxx --name 名称 [--level mechanism] [--detail ...] [--with-doc]
 *   new concept --kind problem  --id xxx --name 名称 [--parent coupling]
 *   new concept --kind solution --id xxx --name 名称 --gof-group 结构型 --gof-subgroup 接口对接
 *   new leaf --cat b --symptom "问题表现" --tags consistency --keywords ttl,invalidate-first [--note ...] [--warning ...]
 */
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadAll, readJson, treeDir, writeJson } from "./load.ts";
import { validate } from "./src/validate.ts";
import { PATTERN_KEYS } from "./src/patterns-layout.ts";
import type { Category, ConceptEntry, ConceptKind, Leaf } from "./src/types.ts";

const die = (msg: string): never => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

export function runNew(
  cmd: string | undefined,
  flags: Record<string, string>,
): void {
  const { categories, concepts } = loadAll();

  if (cmd === "concept") {
    const kind = flags.kind as ConceptKind;
    if (kind !== "problem" && kind !== "solution")
      die("--kind 必须是 problem 或 solution");
    const id = flags.id ?? die("--id 必填(小写 kebab-case)");
    if (!/^[a-z][a-z0-9-]*$/.test(id)) die("--id 必须是小写 kebab-case");
    if (concepts[id]) die(`概念已存在:${id}`);
    const name = flags.name ?? die("--name 必填");

    const c: Record<string, unknown> = {
      name,
      detail: flags.detail ?? "TODO:一句话说清怎么做 / 怎么识别,点名具体手段",
    };
    if (kind === "problem") {
      if (flags.level) die("problem 概念没有 level 字段");
      if (flags.parent) {
        if (!concepts[flags.parent]) die(`parent 概念不存在:${flags.parent}`);
        if (concepts[flags.parent].kind !== "problem")
          die(`parent 必须是 problem 概念`);
        c.parent = flags.parent;
      }
    } else {
      if (flags.level) {
        if (!["principle", "pattern", "mechanism"].includes(flags.level))
          die("--level 只能是 principle / pattern / mechanism");
        c.level = flags.level;
      }
      if (flags["gof-group"]) {
        const key = `${flags["gof-group"]}/${flags["gof-subgroup"] ?? ""}`;
        if (!PATTERN_KEYS.has(key))
          die(`gof 分组「${key}」不在注册表 patterns-layout.ts`);
        c.gof = {
          group: flags["gof-group"],
          subgroup: flags["gof-subgroup"],
          intent: flags["gof-intent"] ?? "TODO:一句话意图",
        };
        c.level ??= "pattern";
      }
    }
    // 详细讲解是同名 .md 文件(Markdown):--with-doc 生成小节骨架,--doc 给定内容
    const docContent = flags.doc
      ? flags.doc
      : flags["with-doc"]
        ? "### 为什么\n\nTODO\n\n### 做法\n\nTODO\n\n### 常见错误\n\nTODO\n"
        : undefined;
    if (docContent !== undefined) {
      writeFileSync(
        join(treeDir, "concepts", kind, `${id}.md`),
        docContent.endsWith("\n") ? docContent : docContent + "\n",
        "utf8",
      );
    }
    writeJson(join(treeDir, "concepts", kind, `${id}.json`), c);
    console.log(
      `✓ 已创建 tree/concepts/${kind}/${id}.json${docContent ? " + .md" : ""}`,
    );
    validate(categories, {
      ...concepts,
      [id]: {
        ...(c as object),
        kind,
        ...(docContent ? { doc: docContent } : {}),
      } as ConceptEntry,
    });
    console.log("✓ 校验通过。下一步:在叶子里引用它,并补 detail / .md");
    return;
  }

  if (cmd === "leaf") {
    const catId = flags.cat ?? die("--cat 必填(大类 id:a / b / c)");
    const files = readdirSync(join(treeDir, "content")).filter((f) =>
      f.endsWith(".json"),
    );
    const file = files.find(
      (f) => readJson<Category>(join(treeDir, "content", f)).id === catId,
    );
    if (!file)
      die(`找不到大类「${catId}」(现有:${categories.map((c) => c.id).join(" / ")})`);

    const symptom = flags.symptom ?? die("--symptom 必填");
    const tags = (flags.tags ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const keywords = (flags.keywords ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!keywords.length) die("--keywords 必填(逗号分隔的概念 id)");
    for (const t of tags) {
      if (!concepts[t]) die(`tags 引用了不存在的概念:${t}`);
      if (concepts[t].kind !== "problem") die(`${t} 是 solution 概念,不能进 tags`);
    }
    for (const k of keywords) {
      if (!concepts[k])
        die(`keywords 引用了不存在的概念:${k}(先 new concept 创建)`);
      if (concepts[k].kind !== "solution")
        die(`${k} 是 problem 概念,不能进 keywords`);
    }

    const leaf: Leaf = {
      symptom,
      ...(flags.note && { symptomNote: flags.note }),
      ...(tags.length && { tags }),
      keywords,
      ...(flags.warning && { warning: flags.warning }),
    };
    const cat = readJson<Category>(join(treeDir, "content", file));
    cat.leaves.push(leaf);
    writeJson(join(treeDir, "content", file), cat);
    console.log(`✓ 已添加到 content/${file}(第 ${cat.leaves.length} 片叶子)`);
    validate(categories, concepts);
    console.log("✓ 校验通过");
    return;
  }

  die(`未知子命令「${cmd ?? "(空)"}」,应为 concept 或 leaf`);
}
