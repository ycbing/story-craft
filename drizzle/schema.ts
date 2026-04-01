import { pgTable, text, integer, timestamp, foreignKey, uuid, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	credits: integer().default(5).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
});

export const books = pgTable("books", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: text().default('未命名绘本').notNull(),
	coverUrl: text("cover_url"),
	stylePrompt: text("style_prompt"),
	mainCharacterDesc: text("main_character_desc"),
	status: text().default('draft'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "books_user_id_users_id_fk"
		}),
]);

export const pages = pgTable("pages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookId: uuid("book_id").notNull(),
	pageNumber: integer("page_number").notNull(),
	prompt: text(),
	aiText: text("ai_text"),
	aiImageUrl: text("ai_image_url"),
	canvasState: jsonb("canvas_state"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bookId],
			foreignColumns: [books.id],
			name: "pages_book_id_books_id_fk"
		}).onDelete("cascade"),
]);
