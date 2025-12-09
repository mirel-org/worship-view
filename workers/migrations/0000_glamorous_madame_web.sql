CREATE TABLE "songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"full_text" text NOT NULL,
	CONSTRAINT "songs_name_unique" UNIQUE("name")
);
