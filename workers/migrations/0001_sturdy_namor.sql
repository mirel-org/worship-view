CREATE TABLE "service_list_songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_id" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "service_list_songs_song_id_unique" UNIQUE("song_id")
);
--> statement-breakpoint
ALTER TABLE "service_list_songs" ADD CONSTRAINT "service_list_songs_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;