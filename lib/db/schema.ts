import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----------------------------------------------------------------------
// 1. 用户表 (Users)
// 虽然 Clerk 管理认证，但我们需要一个本地表来存"积分"或"会员状态"
// ----------------------------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey(), // 这里直接存 Clerk 的 User ID (user_2N...)
  email: text("email").notNull(),
  credits: integer("credits").default(5).notNull(), // 初始送5个积分
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 2. 绘本表 (Books)
// 一本书的基本元数据
// ----------------------------------------------------------------------
export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(), // 使用 UUID，生成的 URL 更难被猜到
  userId: text("user_id")
    .notNull()
    .references(() => users.id), // 关联用户

  title: text("title").notNull().default("未命名绘本"),
  coverUrl: text("cover_url"), // 封面图

  // 核心配置：这决定了整本书的 AI 风格
  stylePrompt: text("style_prompt"), // 例如: "Ghibli style, watercolor"
  mainCharacterDesc: text("main_character_desc"), // 例如: "A small black cat"

  status: text("status", { enum: ["draft", "completed"] }).default("draft"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 定义 User 和 Book 的关联关系 (Drizzle 语法)
export const usersRelations = relations(users, ({ many }) => ({
  books: many(books),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(users, {
    fields: [books.userId],
    references: [users.id],
  }),
  pages: many(pages),
}));

// ----------------------------------------------------------------------
// 3. 页面表 (Pages) - 核心中的核心
// 每一页都包含：AI生成的图文 + 你的 Fabric 画布状态
// ----------------------------------------------------------------------
export const pages = pgTable("pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }), // 书删了，页也没了

  pageNumber: integer("page_number").notNull(), // 第几页

  // AI 生成的原始素材 (用于以后重新生成或参考)
  prompt: text("prompt"), // 当时生成这一页用的 Prompt
  aiText: text("ai_text"), // AI 写的文案
  aiImageUrl: text("ai_image_url"), // AI 生成的底图

  // 🔥 关键字段：Fabric.js 的完整状态
  // 我们使用 Postgres 的 jsonb 类型，它可以存巨大的 JSON 对象，而且查询速度快
  canvasState: jsonb("canvas_state"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 定义 Page 和 Book 的关联
export const pagesRelations = relations(pages, ({ one }) => ({
  book: one(books, {
    fields: [pages.bookId],
    references: [books.id],
  }),
}));
