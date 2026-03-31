import {
  pgTable,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----------------------------------------------------------------------
// 1. 用户表 (Users)
// ----------------------------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  credits: integer("credits").default(5).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).$defaultFn(() => new Date()),
});

// ----------------------------------------------------------------------
// 2. 绘本表 (Books)
// ----------------------------------------------------------------------
export const books = pgTable("books", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),

  title: text("title").notNull().default("未命名绘本"),
  coverUrl: text("cover_url"),

  stylePrompt: text("style_prompt"),
  mainCharacterDesc: text("main_character_desc"),

  status: text("status", { enum: ["draft", "completed"] }).default("draft"),

  createdAt: timestamp("created_at", { withTimezone: true }).$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$defaultFn(() => new Date()),
});

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
// 3. 页面表 (Pages)
// ----------------------------------------------------------------------
export const pages = pgTable("pages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),

  pageNumber: integer("page_number").notNull(),

  prompt: text("prompt"),
  aiText: text("ai_text"),
  aiImageUrl: text("ai_image_url"),

  canvasState: text("canvas_state"),

  createdAt: timestamp("created_at", { withTimezone: true }).$defaultFn(() => new Date()),
});

export const pagesRelations = relations(pages, ({ one }) => ({
  book: one(books, {
    fields: [pages.bookId],
    references: [books.id],
  }),
}));
