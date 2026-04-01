import { relations } from "drizzle-orm/relations";
import { users, books, pages } from "./schema";

export const booksRelations = relations(books, ({one, many}) => ({
	user: one(users, {
		fields: [books.userId],
		references: [users.id]
	}),
	pages: many(pages),
}));

export const usersRelations = relations(users, ({many}) => ({
	books: many(books),
}));

export const pagesRelations = relations(pages, ({one}) => ({
	book: one(books, {
		fields: [pages.bookId],
		references: [books.id]
	}),
}));