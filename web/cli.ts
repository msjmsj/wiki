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
    const bin = process.platform === "win32" ? "tsc.cmd" : "tsc";
    const r = spawnSync(bin, ["--noEmit"], { stdio: "inherit" });
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
