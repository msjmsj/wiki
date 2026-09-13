import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { fs: { allow: [".."] } }, // 数据文件在 ../tree 下
});
