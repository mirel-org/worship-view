import { pgTable, unique, serial, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const songs = pgTable("songs", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	fullText: text("full_text").notNull(),
}, (table) => [
	unique("songs_name_unique").on(table.name),
]);
