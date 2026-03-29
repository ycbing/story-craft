/**
 * 数据库初始化脚本 — 在 server.js 启动前运行
 * 如果表不存在则自动创建（基于 lib/db/schema.ts）
 */
import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DB_PATH || path.join(process.cwd(), "local.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

const createTables = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 5,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL DEFAULT '未命名绘本',
  cover_url TEXT,
  style_prompt TEXT,
  main_character_desc TEXT,
  status TEXT DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  prompt TEXT,
  ai_text TEXT,
  ai_image_url TEXT,
  canvas_state TEXT,
  created_at TEXT NOT NULL
);
`;

sqlite.exec(createTables);
sqlite.close();
console.log("✓ Database initialized successfully");
process.exit(0);
