/**
 * 统一 CLI 入口。用法:
 *   node web/cli.ts new concept --kind solution --id xxx --name 名称 […]
 *   node web/cli.ts new leaf --cat b --symptom "…" --keywords ttl
 *   node web/cli.ts check        数据校验
 *   node web/cli.ts dev          开发服务器
 *   node web/cli.ts build        校验 + 生产构建
 *   node web/cli.ts typecheck    tsc 类型检查
 */

import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

// 版本号 = 当日日期 + 提交计数(每次提交自动增加);CI 里 checkout 需 fetch-depth: 0
const VERSION = (() => {
  const d = new Date();
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  try {
    const count = execSync("git rev-list --count HEAD", { encoding: "utf8" }).trim();
    return `v${date}+${count}`;
  } catch {
    return `v${date}+local`;
  }
})();
process.env.VITE_APP_VERSION = VERSION;

const [cmd, sub, ...rest] = process.argv.slice(2);

// 无论从哪里调用(root shim 或 npm script),都先把工作目录定到 web/
//(vite 的入口解析、outDir 等依赖 cwd)
const webDir = fileURLToPath(new URL(".", import.meta.url));
process.chdir(webDir);

// 解析 --key value;布尔 flag(后无值或后跟另一个 flag)取 "true"
const flags: Record<string, string> = {};
for (let i = 0; i < rest.length; i++) {
  const k = rest[i];
  if (!k?.startsWith("--")) continue;
  const next = rest[i + 1];
  if (next === undefined || next.startsWith("--")) flags[k.slice(2)] = "true";
  else {
    flags[k.slice(2)] = next;
    i++;
  }
}

switch (cmd) {
  case "new": {
    const { runNew } = await import("./new.ts");
    runNew(sub, flags);
    break;
  }
  case "check": {
    const { runCheck } = await import("./check.ts");
    runCheck();
    break;
  }
  case "dev": {
    const { createServer } = await import("vite");
    // 默认绑 127.0.0.1:只绑 IPv6 ::1 时,部分浏览器解析 localhost 到 IPv4 会打不开
    const server = await createServer({
      root: webDir,
      server: { host: flags.host || "127.0.0.1" },
    });
    await server.listen();
    server.printUrls();
    break;
  }
  case "build": {
    const { runCheck } = await import("./check.ts");
    runCheck(); // 校验失败会在内部 process.exit
    const { build } = await import("vite");
    await build();
    break;
  }
  case "typecheck": {
    const { spawnSync } = await import("node:child_process");
    // 直接调 node 跑 tsc 入口,避免 Windows 上 spawn .cmd 需要 shell 的问题
    const r = spawnSync(
      process.execPath,
      ["node_modules/typescript/bin/tsc", "--noEmit"],
      { stdio: "inherit" },
    );
    process.exit(r.status ?? 1);
  }
  default:
    console.log(`分化树 CLI。命令:
  new concept|leaf   脚手架(模板 + 冲突检查 + 立即校验)
  check              数据校验
  dev                开发服务器
  build              校验 + 生产构建
  typecheck          tsc 类型检查`);
    process.exit(cmd ? 1 : 0);
}
