import { pgTable, serial, text, integer, unique } from 'drizzle-orm/pg-core';

export const songs = pgTable('songs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  fullText: text('full_text').notNull(),
});

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;

export const serviceListSongs = pgTable('service_list_songs', {
  id: serial('id').primaryKey(),
  songId: integer('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
}, (table) => ({
  uniqueSongId: unique().on(table.songId),
}));

export type ServiceListSong = typeof serviceListSongs.$inferSelect;
export type NewServiceListSong = typeof serviceListSongs.$inferInsert;

