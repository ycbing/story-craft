import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // 加载你的环境变量

export default defineConfig({
  schema: "./lib/db/schema.ts", // 指向刚才写的文件
  out: "./drizzle", // 迁移文件生成的目录
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!, // 确保你在 .env.local 里填了 Neon 的链接
  },
});
