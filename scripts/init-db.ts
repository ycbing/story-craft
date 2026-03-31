/**
 * 数据库初始化脚本 — 在 server.js 启动前运行
 * 如果表不存在则自动创建（基于 lib/db/schema.ts）
 */
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://storycraft:storycraft123@localhost:5432/storycraft",
});

const createTables = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL DEFAULT '未命名绘本',
  cover_url TEXT,
  style_prompt TEXT,
  main_character_desc TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  prompt TEXT,
  ai_text TEXT,
  ai_image_url TEXT,
  canvas_state TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function init() {
  const client = await pool.connect();
  try {
    await client.query(createTables);
    console.log("✓ Database initialized successfully");
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
  process.exit(0);
}

init();
